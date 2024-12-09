import { describe, test, beforeAll, expect } from '@jest/globals';
import * as dotenv from 'dotenv';

import clients from '../config/clients.json';
import type { Client } from '../types';

describe('Base path', () => {
  let client: Client | undefined;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'client-credentials-flow-client-id');
    expect(client).toBeDefined();
  });

  test('Discovery Endpoint', async () => {
    const response = await fetch(process.env.OIDC_DISCOVERY_ENDPOINT_WITH_BASE_PATH);
    const result = (await response.json()) as unknown;
    expect(result).toHaveProperty('token_endpoint', process.env.OIDC_TOKEN_URL_WITH_BASE_PATH);
  });

  test('Token Endpoint', async () => {
    if (!client) throw new Error('Client not found');

    const parameters = new URLSearchParams({
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0] ?? '',
      grant_type: 'client_credentials',
      scope: client.AllowedScopes.join(' '),
    });

    const response = await fetch(process.env.OIDC_TOKEN_URL_WITH_BASE_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: parameters.toString(),
    });
    expect(response).toBeDefined();
  });
});
