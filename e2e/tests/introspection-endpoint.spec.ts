import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';

import { sign } from 'jws';
import apiResources from '../config/api-resources.json';
import clients from '../config/clients-configuration.json';
import type { ApiResource, Client } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Introspection Endpoint', () => {
  let apiResource: ApiResource;
  let requestConfig: AxiosRequestConfig;

  beforeAll(() => {
    dotenv.config();
    apiResource = apiResources.find(aR => aR.Name === 'some-app');
    expect(apiResource).toBeDefined();
    const auth = Buffer.from(`${apiResource.Name}:${apiResource.ApiSecrets?.[0]}`).toString('base64');
    requestConfig = {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  });

  test('Valid token', async () => {
    const client: Client = clients.find(c => c.ClientId === 'introspect-client-id');
    expect(client).toBeDefined();

    const parameters = {
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0],
      grant_type: 'client_credentials',
      scope: client.AllowedScopes[0],
    };

    const tokenResponse = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(parameters));

    expect(tokenResponse).toBeDefined();
    const token = tokenResponse.data.access_token;
    expect(token).toBeDefined();
    const requestBody = querystring.stringify({
      token,
    });

    const response = await axios.post(process.env.OIDC_INTROSPECTION_URL, requestBody, requestConfig);

    expect(response).toBeDefined();
    expect(response.data).toMatchSnapshot();
  });

  test('Unknown token', async () => {
    const requestBody = querystring.stringify({
      token: sign({
        header: {
          alg: 'HS256',
          typ: 'JWT',
        },
        payload: {
          nbf: 1597042883,
          exp: 1597042884,
          iss: 'http://localhost:8080',
          aud: 'some-app',
          client_id: 'introspect-client-id',
          jti: '96E474ECF2D289741861976143C2BF54',
          iat: 1597042883,
          scope: ['some-app-scope-1'],
        },
        secret: 'very-strong-secret',
      }),
    });

    const response = await axios.post(process.env.OIDC_INTROSPECTION_URL, requestBody, requestConfig);

    expect(response).toBeDefined();
    expect(response.data).toMatchSnapshot();
  });
});
