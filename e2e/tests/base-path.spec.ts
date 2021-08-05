import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import axios from 'axios';

import clients from '../config/clients-configuration.json';
import type { Client } from '../types';

describe('Base path', () => {
  let client: Client;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'client-credentials-flow-client-id');
    expect(client).toBeDefined();
  });

  test('Discovery Endpoint', async () => {
    const response = await axios.get(process.env.OIDC_DISCOVERY_ENDPOINT_WITH_BASE_PATH);
    expect(response.data.token_endpoint).toEqual(process.env.OIDC_TOKEN_URL_WITH_BASE_PATH);
  });

  test('Token Endpoint', async () => {
    const parameters = {
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0],
      grant_type: 'client_credentials',
      scope: client.AllowedScopes.join(' '),
    };

    const response = await axios.post(process.env.OIDC_TOKEN_URL_WITH_BASE_PATH, querystring.stringify(parameters));
    expect(response).toBeDefined();
  });
});
