import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import { chromium, Page, Browser } from 'playwright-chromium';
import { decode as decodeJWT } from 'jws';

describe('Authorization Endpoint', () => {
  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    dotenv.config();

    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Implicit Flow', async () => {
    const parameters = {
      client_id: 'implicit-mock-client',
      scope: 'openid',
      response_type: 'id_token token',
      redirect_uri: 'https://www.google.com',
      state: 'abc',
      nonce: 'xyz',
    };
    const url = `${process.env.OIDC_AUTHORIZE_URL}?${querystring.stringify(parameters)}`;
    const response = await page.goto(url);
    expect(response.ok()).toBeTruthy();

    await page.waitForSelector('#Username');
    await page.type('#Username', 'User1');
    await page.type('#Password', 'pwd');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.origin).toEqual('https://www.google.com');
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
    expect(scope).toEqual('openid');
  });
});
