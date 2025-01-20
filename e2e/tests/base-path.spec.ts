import { describe, test, beforeAll, expect } from '@jest/globals';

import clients from '../config/clients.json';
import type { Client } from '../types';
import { oidcDiscoveryEndpointWithBasePath, oidcTokenUrlWithBasePath } from 'e2e/helpers/endpoints';

describe('Base path', () => {
  let client: Client | undefined;

  beforeAll(() => {
    client = clients.find(c => c.ClientId === 'client-credentials-flow-client-id');
    expect(client).toBeDefined();
  });

  test('Discovery Endpoint', async () => {
    const response = await fetch(oidcDiscoveryEndpointWithBasePath);
    expect(response.ok).toBe(true);
    const result = (await response.json()) as unknown;
    expect(result).toHaveProperty('token_endpoint', oidcTokenUrlWithBasePath.href);
  });

  test('CORS', async () => {
    const origin = 'https://google.com';
    const response = await fetch(process.env.OIDC_DISCOVERY_ENDPOINT_WITH_BASE_PATH, {
      headers: {
        origin,
      },
    });
    expect(response.headers.get('access-control-allow-origin')).toEqual(origin);
  });

  test('Token Endpoint', async () => {
    if (!client) throw new Error('Client not found');

    const parameters = new URLSearchParams({
      client_id: client.ClientId,
      client_secret: client.ClientSecrets?.[0] ?? '',
      grant_type: 'client_credentials',
      scope: client.AllowedScopes.join(' '),
    });

    const response = await fetch(oidcTokenUrlWithBasePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: parameters.toString(),
    });
    expect(response.ok).toBe(true);
    const result = (await response.json()) as { access_token: string };
    expect(result.access_token).toBeDefined();
  });
});
