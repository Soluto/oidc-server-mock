import * as dotenv from 'dotenv';

import clients from '../../config/clients-configuration.json';
import { introspectEndpoint, tokenEndpoint } from '../../helpers';
import type { Client } from '../../types';

describe('Client Credentials Flow', () => {
  let client: Client | undefined;
  let token: string;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'client-credentials-flow-client-id');
    expect(client).toBeDefined();
  });

  test('Token Endpoint', async () => {
    if (!client) throw new Error('Client not found');

    const parameters = new URLSearchParams({
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0] ?? '',
      grant_type: 'client_credentials',
      scope: client.AllowedScopes.join(' '),
    });

    token = await tokenEndpoint(parameters);
  });

  test('Introspection Endpoint', async () => {
    await introspectEndpoint(token, 'some-app');
  });
});
