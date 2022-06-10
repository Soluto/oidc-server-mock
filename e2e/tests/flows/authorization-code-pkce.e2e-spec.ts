import * as crypto from 'crypto';

import * as dotenv from 'dotenv';
import { Browser, BrowserContext, chromium, Page } from 'playwright-chromium';

import clients from '../../config/clients-configuration.json';
import users from '../../config/user-configuration.json';
import { authorizationEndpoint, introspectEndpoint, tokenEndpoint, userInfoEndpoint } from '../../helpers';
import type { Client, User } from '../../types';

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
  let context: BrowserContext;
  let page: Page;
  let client: Client;

  beforeAll(async () => {
    dotenv.config();

    browser = await chromium.launch();
    client = clients.find(c => c.ClientId === 'authorization-code-with-pkce-client-id');
    expect(client).toBeDefined();
  });

  beforeEach(async () => {
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();
  });

  afterEach(async () => {
    await page.close();
    await context.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe.each(testCases)('- %s -', (user: User) => {
    test('Authorization Endpoint', async () => {
      codeVerifier = base64URLEncode(crypto.randomBytes(32));

      const codeChallenge = base64URLEncode(sha256(codeVerifier));

      const parameters = new URLSearchParams({
        client_id: client.ClientId,
        scope: client.AllowedScopes.join(' '),
        response_type: 'code',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: 'abc',
        nonce: 'xyz',
      });
      const redirectedUrl = await authorizationEndpoint(page, parameters, user, parameters.get('redirect_uri'));
      expect(redirectedUrl.searchParams.has('code')).toBeTruthy();
      code = redirectedUrl.searchParams.get('code');
    });

    test('Token Endpoint', async () => {
      const parameters = new URLSearchParams({
        client_id: client.ClientId,
        code,
        grant_type: 'authorization_code',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        code_verifier: codeVerifier,
        scope: client.AllowedScopes.join(' '),
      });

      token = await tokenEndpoint(parameters);
    });

    test('UserInfo Endpoint', async () => {
      await userInfoEndpoint(token);
    });

    test('Introspection Endpoint', async () => {
      await introspectEndpoint(token, 'some-app');
    });
  });
});
