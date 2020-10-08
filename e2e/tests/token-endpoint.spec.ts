import * as querystring from 'querystring';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { decode } from 'jws';

import users from '../config/user-configuration.json';
import clients from '../config/clients-configuration.json';
import type { Client, User } from '../types';

const testCases: User[] = users.sort((u1, u2) => (u1.Username < u2.Username ? -1 : 1));

describe('Token Endpoint', () => {
  let clientCredentialsFlowClient: Client;
  let passwordFlowClient: Client;

  beforeAll(() => {
    dotenv.config();
    clientCredentialsFlowClient = clients.find(c => c.ClientId === 'client-credentials-flow-client-id');
    expect(clientCredentialsFlowClient).toBeDefined();

    passwordFlowClient = clients.find(c => c.ClientId === 'password-flow-client-id');
    expect(passwordFlowClient).toBeDefined();
  });

  test('Client Credentials', async () => {
    const parameters = {
      client_id: clientCredentialsFlowClient.ClientId,
      client_secret: clientCredentialsFlowClient.ClientSecrets?.[0],
      grant_type: 'client_credentials',
      scope: clientCredentialsFlowClient.AllowedScopes,
    };

    const response = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(parameters));

    expect(response).toBeDefined();
    expect(response.data.access_token).toBeDefined();
    const token = decode(response.data.access_token);

    expect(token).toMatchSnapshot(clientCredentialsFlowClient.ClientId);
  });

  test.each(testCases)('Password', async (user: User) => {
    const parameters = {
      client_id: passwordFlowClient.ClientId,
      username: user.Username,
      password: user.Password,
      grant_type: 'password',
      scope: passwordFlowClient.AllowedScopes,
    };

    const response = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(parameters));

    expect(response).toBeDefined();
    expect(response.data.access_token).toBeDefined();
    const token = decode(response.data.access_token);

    expect(token).toMatchSnapshot(user.Username);
  });
});
