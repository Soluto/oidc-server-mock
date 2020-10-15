import * as dotenv from 'dotenv';

import clients from '../../config/clients-configuration.json';
import type { Client } from '../../types';
import { introspectEndpoint, tokenEndpoint } from '../../helpers';

describe('Client Credentials Flow', () => {
  let client: Client;
  let token: string;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'client-credentials-flow-client-id');
    expect(client).toBeDefined();
  });

  test('Token Endpoint', async () => {
    const parameters = {
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0],
      grant_type: 'client_credentials',
      scope: client.AllowedScopes,
    };

    token = await tokenEndpoint(parameters);
  });

  test('Introspection Endpoint', async () => {
    await introspectEndpoint(token, 'some-app');
  });
});
