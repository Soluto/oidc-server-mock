import { describe, test, beforeAll, expect } from '@jest/globals';
import Chance from 'chance';

import clients from '../../config/clients.json';
import { introspectEndpoint, tokenEndpoint, userInfoEndpoint } from '../../helpers';
import { Client, User } from '../../types';
import { oidcUserManagementUrl } from 'e2e/helpers/endpoints';

describe('User management', () => {
  const chance = new Chance();
  const subjectId = chance.guid({ version: 4 });
  const firstName = chance.first();
  const lastName = chance.last();
  const username = `${firstName}_${lastName}`;
  const password = chance.string({ length: 8 });
  const email = chance.email();

  let client: Client | undefined;
  let token: string;

  beforeAll(() => {
    client = clients.find(c => c.ClientId === 'password-flow-client-id');
  });

  test('Get user from configuration', async () => {
    const configUserId = 'user_with_all_claim_types';
    const configUsername = 'user_with_all_claim_types';
    const response = await fetch(`${oidcUserManagementUrl.href}/${configUserId}`);
    expect(response.status).toBe(200);
    const receivedUser = (await response.json()) as User;
    expect(receivedUser).toHaveProperty('username', configUsername);
  });

  test('Create user', async () => {
    const user: User = {
      SubjectId: subjectId,
      Username: username,
      Password: password,
      Claims: [
        {
          Type: 'name',
          Value: `${firstName} ${lastName}`,
        },
        {
          Type: 'email',
          Value: email,
        },
        {
          Type: 'some-app-user-custom-claim',
          Value: `${firstName}'s Custom User Claim`,
        },
        {
          Type: 'some-app-scope-1-custom-user-claim',
          Value: `${firstName}'s Scope Custom User Claim`,
        },
        {
          Type: 'some-custom-identity-user-claim',
          Value: `${firstName}'s Custom User Claim`,
        },
      ],
    };
    const response = await fetch(oidcUserManagementUrl, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(200);
    const result = (await response.json()) as unknown;
    expect(result).toEqual(subjectId);
  });

  test('Get user', async () => {
    const response = await fetch(`${oidcUserManagementUrl.href}/${subjectId}`);
    expect(response.status).toBe(200);
    const receivedUser = (await response.json()) as User;
    expect(receivedUser).toHaveProperty('username', username);
    expect(receivedUser).toHaveProperty('isActive', true);
  });

  test('Token Endpoint', async () => {
    const parameters = new URLSearchParams({
      client_id: client.ClientId,
      username: username,
      password: password,
      grant_type: 'password',
      scope: client.AllowedScopes.join(' '),
    });

    token = await tokenEndpoint(parameters, {
      payload: {
        sub: expect.any(String) as unknown,
        ['some-app-user-custom-claim']: expect.any(String) as unknown,
        ['some-app-scope-1-custom-user-claim']: expect.any(String) as unknown,
      },
    });
  });

  test('UserInfo Endpoint', async () => {
    await userInfoEndpoint(token, {
      sub: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      ['some-custom-identity-user-claim']: expect.any(String) as unknown,
    });
  }, 10000);

  test('Introspection Endpoint', async () => {
    await introspectEndpoint(token, 'some-app', {
      sub: expect.any(String),
      ['some-app-user-custom-claim']: expect.any(String) as unknown,
      ['some-app-scope-1-custom-user-claim']: expect.any(String) as unknown,
    });
  });
});
