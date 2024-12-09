import { describe, test, beforeAll, afterAll, beforeEach, afterEach, expect } from '@jest/globals';

import * as fs from 'fs';
import path from 'path';

import * as dotenv from 'dotenv';
import { decode as decodeJWT } from 'jws';
import { Browser, BrowserContext, chromium, Page } from 'playwright-chromium';
import * as yaml from 'yaml';

import clients from '../../config/clients.json';
import { authorizationEndpoint, introspectEndpoint, userInfoEndpoint } from '../../helpers';
import type { Client, User } from '../../types';

const users = yaml.parse(
  fs.readFileSync(path.join(process.cwd(), './config/users.yaml'), { encoding: 'utf8' }),
) as User[];

const testCases: User[] = users
  .map(u => ({
    ...u,
    toString: function () {
      return (this as User).SubjectId;
    },
  }))
  .sort((u1, u2) => (u1.SubjectId < u2.SubjectId ? -1 : 1));

describe('Implicit Flow', () => {
  let token: string;

  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let client: Client | undefined;

  beforeAll(async () => {
    dotenv.config();

    browser = await chromium.launch();
    client = clients.find(c => c.ClientId === 'implicit-flow-client-id');
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
      const parameters = new URLSearchParams({
        client_id: client.ClientId,
        scope: client.AllowedScopes.join(' '),
        response_type: 'id_token token',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        state: 'abc',
        nonce: 'xyz',
      });

      const redirectedUrl = await authorizationEndpoint(page, parameters, user, parameters.get('redirect_uri'));
      const hash = redirectedUrl.hash.slice(1);
      const query = new URLSearchParams(hash);

      const tokenParameter = query.get('access_token');
      expect(typeof tokenParameter).toBe('string');
      token = tokenParameter;
      const decodedAccessToken = decodeJWT(token);
      expect(decodedAccessToken).toMatchSnapshot();
    });

    test('UserInfo Endpoint', async () => {
      await userInfoEndpoint(token);
    });

    test('Introspection Endpoint', async () => {
      await introspectEndpoint(token, 'some-app');
    });

    test('Authorization Endpoint (id_token only)', async () => {
      const parameters = new URLSearchParams({
        client_id: client.ClientId,
        scope: 'openid profile email some-custom-identity',
        response_type: 'id_token',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        state: 'abc',
        nonce: 'xyz',
      });
      const redirectedUrl = await authorizationEndpoint(page, parameters, user, parameters.get('redirect_uri'));
      const hash = redirectedUrl.hash.slice(1);
      const query = new URLSearchParams(hash);

      const tokenParameter = query.get('id_token');
      expect(typeof tokenParameter).toBe('string');
      token = tokenParameter;
      const decodedAccessToken = decodeJWT(token);
      expect(decodedAccessToken).toMatchSnapshot();
    });
  });
});
