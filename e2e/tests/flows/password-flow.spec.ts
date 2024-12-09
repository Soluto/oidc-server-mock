import { describe, test, beforeAll, expect } from '@jest/globals';

import * as fs from 'fs';
import path from 'path';

import * as dotenv from 'dotenv';
import * as yaml from 'yaml';

import clients from '../../config/clients.json';
import { introspectEndpoint, tokenEndpoint, userInfoEndpoint } from '../../helpers';
import type { Client, User } from '../../types';

const users = yaml.parse(
  fs.readFileSync(path.join(process.cwd(), './config/users.yaml'), { encoding: 'utf8' }),
) as User[];

const testCases: User[] = users
  .map(u => ({
    ...u,
    toString: function () {
      return (this as User).SubjectId;
    },
  }))
  .sort((u1, u2) => (u1.SubjectId < u2.SubjectId ? -1 : 1));

describe('Password Flow', () => {
  let client: Client | undefined;
  let token: string;

  beforeAll(() => {
    dotenv.config();
    client = clients.find(c => c.ClientId === 'password-flow-client-id');
    expect(client).toBeDefined();
  });

  describe.each(testCases)('- %s -', (user: User) => {
    test('Token Endpoint', async () => {
      if (!client) throw new Error('Client not found');

      const parameters = new URLSearchParams({
        client_id: client.ClientId,
        username: user.Username,
        password: user.Password,
        grant_type: 'password',
        scope: client.AllowedScopes.join(' '),
      });

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
