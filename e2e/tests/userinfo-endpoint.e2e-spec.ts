import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import { chromium, Page, Browser } from 'playwright-chromium';
import axios from 'axios';

import users from '../config/user-configuration.json';
import clients from '../config/clients-configuration.json';
import type { User, Client } from '../types';

describe('UserInfo Endpoint', () => {
  let browser: Browser;
  let page: Page;
  let implicitFlowClient: Client;
  beforeAll(async () => {
    dotenv.config();

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

  describe.each(users)('', (user: User) => {
    let accessToken: string;

    test(`Retrieve user access token ${user.SubjectId}`, async () => {
      const parameters = {
        client_id: implicitFlowClient.ClientId,
        scope: 'openid profile',
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

      const token = query['access_token'];
      expect(typeof token).toEqual('string');
      accessToken = token as string;
    });

    test('Invoke UserInfo endpoint', async () => {
      const response = await axios.get(process.env.OIDC_USERINFO_URL, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      expect(response.data).toMatchSnapshot();
    });
  });
});
