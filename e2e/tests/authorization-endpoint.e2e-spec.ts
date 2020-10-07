import * as querystring from 'querystring';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { chromium, Page, Browser } from 'playwright-chromium';
import axios from 'axios';
import { decode as decodeJWT } from 'jws';

import users from '../config/user-configuration.json';
import clients from '../config/clients-configuration.json';
import type { User, Client } from '../types';

const testCases: User[] = users.sort((u1, u2) => (u1.Username < u2.Username ? -1 : 1));

const base64URLEncode = (buffer: Buffer) =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const sha256 = (buffer: crypto.BinaryLike) => crypto.createHash('sha256').update(buffer).digest();

describe('Authorization Endpoint', () => {
  let browser: Browser;
  let page: Page;
  let implicitFlowClient: Client;
  let authorizationCodeFlowClient: Client;
  let authorizationCodeFlowPkceClient: Client;
  beforeAll(async () => {
    dotenv.config();

    process.env.DEBUG = 'pw:api';

    browser = await chromium.launch();

    implicitFlowClient = clients.find(c => c.ClientId === 'implicit-flow-client-id');
    expect(implicitFlowClient).toBeDefined();

    authorizationCodeFlowClient = clients.find(c => c.ClientId === 'authorization-code-client-id');
    expect(authorizationCodeFlowClient).toBeDefined();

    authorizationCodeFlowPkceClient = clients.find(c => c.ClientId === 'authorization-code-with-pkce-client-id');
    expect(authorizationCodeFlowPkceClient).toBeDefined();
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
      redirect_uri: implicitFlowClient.RedirectUris?.[0].replace('*', 'www'),
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
    expect(redirectedUrl.origin).toEqual(parameters.redirect_uri);
    const hash = redirectedUrl.hash.slice(1);
    const query = querystring.parse(hash);

    const idToken = query['id_token'];
    expect(typeof idToken).toEqual('string');
    const decodedIdToken = decodeJWT(idToken as string);
    expect(decodedIdToken).toMatchSnapshot();

    const accessToken = query['access_token'];
    expect(typeof accessToken).toEqual('string');
    const decodedAccessToken = decodeJWT(accessToken as string);
    expect(decodedAccessToken).toMatchSnapshot(`${user.Username} access token`);

    const scope = query['scope'];
    expect(scope).toMatchSnapshot(`${user.Username} scope`);
  });

  test.each(testCases)('Authorization Code Flow', async (user: User) => {
    const authorizationEndpointParameters = {
      client_id: authorizationCodeFlowClient.ClientId,
      scope: 'openid',
      response_type: 'code',
      redirect_uri: authorizationCodeFlowClient.RedirectUris?.[0].replace('*', 'www'),
      state: 'abc',
      nonce: 'xyz',
    };
    const url = `${process.env.OIDC_AUTHORIZE_URL}?${querystring.stringify(authorizationEndpointParameters)}`;
    const authorizationEndpointResponse = await page.goto(url);
    expect(authorizationEndpointResponse.ok()).toBeTruthy();

    await page.waitForSelector('#Username');
    await page.type('#Username', user.Username);
    await page.type('#Password', user.Password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.origin).toEqual(authorizationEndpointParameters.redirect_uri);
    expect(redirectedUrl.searchParams.has('code')).toBeTruthy();
    const code = redirectedUrl.searchParams.get('code');

    const tokenEndpointParameters = {
      client_id: authorizationCodeFlowClient.ClientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: authorizationCodeFlowClient.RedirectUris?.[0].replace('*', 'www'),
      scope: authorizationCodeFlowClient.AllowedScopes[0],
    };

    const tokenEndpointResponse = await axios.post(
      process.env.OIDC_TOKEN_URL,
      querystring.stringify(tokenEndpointParameters)
    );

    expect(tokenEndpointResponse).toBeDefined();
    expect(tokenEndpointResponse.data.access_token).toBeDefined();
    const token = decodeJWT(tokenEndpointResponse.data.access_token);

    expect(token).toMatchSnapshot(`${user.Username} access token`);
  });

  test.each(testCases)('Authorization Code Flow (with PKCE)', async (user: User) => {
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));

    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    const authorizationEndpointParameters = {
      client_id: authorizationCodeFlowPkceClient.ClientId,
      scope: 'openid',
      response_type: 'code',
      redirect_uri: authorizationCodeFlowPkceClient.RedirectUris?.[0].replace('*', 'www'),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: 'abc',
      nonce: 'xyz',
    };
    const url = `${process.env.OIDC_AUTHORIZE_URL}?${querystring.stringify(authorizationEndpointParameters)}`;
    const authorizationEndpointResponse = await page.goto(url);
    expect(authorizationEndpointResponse.ok()).toBeTruthy();

    await page.waitForSelector('#Username');
    await page.type('#Username', user.Username);
    await page.type('#Password', user.Password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.origin).toEqual(authorizationEndpointParameters.redirect_uri);
    expect(redirectedUrl.searchParams.has('code')).toBeTruthy();
    const code = redirectedUrl.searchParams.get('code');

    const tokenEndpointParameters = {
      client_id: authorizationCodeFlowPkceClient.ClientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: authorizationCodeFlowPkceClient.RedirectUris?.[0].replace('*', 'www'),
      code_verifier: codeVerifier,
      scope: authorizationCodeFlowPkceClient.AllowedScopes[0],
    };

    const tokenEndpointResponse = await axios.post(
      process.env.OIDC_TOKEN_URL,
      querystring.stringify(tokenEndpointParameters)
    );

    expect(tokenEndpointResponse).toBeDefined();
    expect(tokenEndpointResponse.data.access_token).toBeDefined();
    const token = decodeJWT(tokenEndpointResponse.data.access_token);

    expect(token).toMatchSnapshot(`${user.Username} access token`);
  });
});
