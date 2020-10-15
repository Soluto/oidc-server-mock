import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import { decode as decodeJWT } from 'jws';
import { chromium, Page, Browser } from 'playwright-chromium';

import type { User, Client } from '../../types';
import users from '../../config/user-configuration.json';
import clients from '../../config/clients-configuration.json';
import { authorizationEndpoint, grants, introspectEndpoint, userInfoEndpoint } from '../../helpers';

const testCases: User[] = users
  .map(u => ({
    ...u,
    toString: function () {
      return this.SubjectId;
    },
  }))
  .sort((u1, u2) => (u1.SubjectId < u2.SubjectId ? -1 : 1));

describe('Implicit Flow', () => {
  let token: string;

  let browser: Browser;
  let page: Page;
  let client: Client;

  beforeAll(async () => {
    dotenv.config();

    browser = await chromium.launch();
    client = clients.find(c => c.ClientId === 'implicit-flow-client-id');
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
      const parameters = {
        client_id: client.ClientId,
        scope: 'openid profile email some-custom-identity some-app-scope-1',
        response_type: 'id_token token',
        redirect_uri: client.RedirectUris?.[0].replace('*', 'www'),
        state: 'abc',
        nonce: 'xyz',
      };
      const redirectedUrl = await authorizationEndpoint(page, parameters, user, parameters.redirect_uri);
      const hash = redirectedUrl.hash.slice(1);
      const query = querystring.parse(hash);

      const tokenParameter = query['access_token'];
      expect(typeof tokenParameter).toEqual('string');
      token = tokenParameter as string;
      const decodedAccessToken = decodeJWT(token);
      expect(decodedAccessToken).toMatchSnapshot();
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
