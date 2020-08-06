import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { decode } from 'jws';

import clients from '../config/clients-configuration.json';
import type { Client } from '../types';

describe('Token Endpoint', () => {
  let client: Client;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'client-credentials-mock-client-id');
    expect(client).toBeDefined();
  });

  test('Client Credentials', async () => {
    const parameters = {
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0],
      grant_type: 'client_credentials',
      scope: client.AllowedScopes[0],
    };

    const response = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(parameters));

    expect(response).toBeDefined();
    expect(response.data.access_token).toBeDefined();
    const token = decode(response.data.access_token);

    expect(token).toMatchSnapshot();
  });
});
