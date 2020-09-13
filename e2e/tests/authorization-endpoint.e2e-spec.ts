import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import { chromium, Page, Browser } from 'playwright-chromium';
import { decode as decodeJWT } from 'jws';

import users from '../config/user-configuration.json';
import clients from '../config/clients-configuration.json';
import type { User, Client } from '../types';

const testCases: User[] = users.sort((u1, u2) => (u1.Username < u2.Username ? -1 : 1));

describe('Authorization Endpoint', () => {
  let browser: Browser;
  let page: Page;
  let implicitFlowClient: Client;
  beforeAll(async () => {
    dotenv.config();

    process.env.DEBUG = 'pw:api';

    browser = await chromium.launch();

    implicitFlowClient = clients.find(c => c.ClientId === 'implicit-flow-client-id');
    expect(implicitFlowClient).toBeDefined();
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

  test.each(testCases)('Implicit Flow', async (user: User) => {
    const parameters = {
      client_id: implicitFlowClient.ClientId,
      scope: 'openid some-custom-identity',
      response_type: 'id_token token',
      redirect_uri: implicitFlowClient.RedirectUris?.[0],
      state: 'abc',
      nonce: 'xyz',
    };
    const url = `${process.env.OIDC_AUTHORIZE_URL}?${querystring.stringify(parameters)}`;
    const response = await page.goto(url);
    expect(response.ok()).toBeTruthy();

    await page.waitForSelector('#Username');
    await page.type('#Username', user.Username);
    await page.type('#Password', user.Password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.origin).toEqual(implicitFlowClient.RedirectUris?.[0]);
    const hash = redirectedUrl.hash.slice(1);
    const query = querystring.parse(hash);

    const idToken = query['id_token'];
    expect(typeof idToken).toEqual('string');
    const decodedIdToken = decodeJWT(idToken as string);
    expect(decodedIdToken).toMatchSnapshot();

    const accessToken = query['access_token'];
    expect(typeof accessToken).toEqual('string');
    const decodedAccessToken = decodeJWT(accessToken as string);
    expect(decodedAccessToken).toMatchSnapshot();

    const scope = query['scope'];
    expect(scope).toMatchSnapshot();
  });
});
