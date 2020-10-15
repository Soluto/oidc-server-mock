import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { chromium, Page, Browser } from 'playwright-chromium';

import type { User, Client } from '../../types';
import users from '../../config/user-configuration.json';
import clients from '../../config/clients-configuration.json';
import { authorizationEndpoint, grants, introspectEndpoint, tokenEndpoint, userInfoEndpoint } from '../../helpers';

const testCases: User[] = users
  .map(u => ({
    ...u,
    toString: function () {
      return this.SubjectId;
    },
  }))
  .sort((u1, u2) => (u1.SubjectId < u2.SubjectId ? -1 : 1));

const base64URLEncode = (buffer: Buffer) =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const sha256 = (buffer: crypto.BinaryLike) => crypto.createHash('sha256').update(buffer).digest();

describe('Authorization Code Flow (with PKCE)', () => {
  let codeVerifier: string;
  let code: string;
  let token: string;

  let browser: Browser;
  let page: Page;
  let client: Client;

  beforeAll(async () => {
    dotenv.config();

    browser = await chromium.launch();
    client = clients.find(c => c.ClientId === 'authorization-code-with-pkce-client-id');
    expect(client).toBeDefined();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe.each(testCases)('- %s -', (user: User) => {
    test('Authorization Endpoint', async () => {
      codeVerifier = base64URLEncode(crypto.randomBytes(32));

      const codeChallenge = base64URLEncode(sha256(codeVerifier));

      const parameters = {
        client_id: client.ClientId,
        scope: 'openid profile email some-custom-identity some-app-scope-1',
        response_type: 'code',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: 'abc',
        nonce: 'xyz',
      };
      const redirectedUrl = await authorizationEndpoint(page, parameters, user, parameters.redirect_uri);
      expect(redirectedUrl.searchParams.has('code')).toBeTruthy();
      code = redirectedUrl.searchParams.get('code');
    });

    test('Token Endpoint', async () => {
      const parameters = {
        client_id: client.ClientId,
        code,
        grant_type: 'authorization_code',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        code_verifier: codeVerifier,
        scope: 'openid profile email some-custom-identity some-app-scope-1',
      };

      token = await tokenEndpoint(parameters);
    });

    test('UserInfo Endpoint', async () => {
      await userInfoEndpoint(token);
    });

    test('Introspection Endpoint', async () => {
      await introspectEndpoint(token, 'some-app');
    });

    test('Grants', async () => {
      await grants(page, user);
    });
  });
});
