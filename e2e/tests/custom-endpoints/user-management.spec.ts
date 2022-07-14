import { Agent } from 'https';

import Chance from 'chance';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

import clients from '../../config/clients.json';
import { introspectEndpoint, tokenEndpoint, userInfoEndpoint } from '../../helpers';
import { Client, User } from '../../types';

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
    dotenv.config();

    client = clients.find(c => c.ClientId === 'password-flow-client-id');
  });

  test('Get user from configuration', async () => {
    const configUserId = 'user_with_all_claim_types';
    const configUsername = 'user_with_all_claim_types';
    const response = await fetch(`${process.env.OIDC_MANAGE_USERS_URL}/${configUserId}`, {
      agent: new Agent({ rejectUnauthorized: false }),
    });
    expect(response.status).toBe(200);
    const receivedUser: User = await response.json();
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
    const response = await fetch(process.env.OIDC_MANAGE_USERS_URL, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: { 'Content-Type': 'application/json' },
      agent: new Agent({ rejectUnauthorized: false }),
    });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result).toEqual(subjectId);
  });

  test('Get user', async () => {
    const response = await fetch(`${process.env.OIDC_MANAGE_USERS_URL}/${subjectId}`, {
      agent: new Agent({ rejectUnauthorized: false }),
    });
    expect(response.status).toBe(200);
    const receivedUser: User = await response.json();
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
        sub: expect.any(String),
        ['some-app-user-custom-claim']: expect.any(String),
        ['some-app-scope-1-custom-user-claim']: expect.any(String),
      },
    });
  });

  test('UserInfo Endpoint', async () => {
    await userInfoEndpoint(token, {
      sub: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      ['some-custom-identity-user-claim']: expect.any(String),
    });
  }, 10000);

  test('Introspection Endpoint', async () => {
    await introspectEndpoint(token, 'some-app', {
      sub: expect.any(String),
      ['some-app-user-custom-claim']: expect.any(String),
      ['some-app-scope-1-custom-user-claim']: expect.any(String),
    });
  });
});
