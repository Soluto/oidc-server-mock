import * as dotenv from 'dotenv';

import clients from '../../config/clients-configuration.json';
import users from '../../config/user-configuration.json';
import { introspectEndpoint, tokenEndpoint, userInfoEndpoint } from '../../helpers';
import type { Client, User } from '../../types';

const testCases: User[] = users
  .map(u => ({
    ...u,
    toString: function () {
      return this.SubjectId;
    },
  }))
  .sort((u1, u2) => (u1.SubjectId < u2.SubjectId ? -1 : 1));

describe('Password Flow', () => {
  let client: Client;
  let token: string;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'password-flow-client-id');
    expect(client).toBeDefined();
  });

  describe.each(testCases)('- %s -', (user: User) => {
    test('Token Endpoint', async () => {
      const parameters = {
        client_id: client.ClientId,
        username: user.Username,
        password: user.Password,
        grant_type: 'password',
        scope: client.AllowedScopes.join(' '),
      };

      token = await tokenEndpoint(parameters);
    });

    test('UserInfo Endpoint', async () => {
      await userInfoEndpoint(token);
    });

    test('Introspection Endpoint', async () => {
      await introspectEndpoint(token, 'some-app');
    });
  });
});
