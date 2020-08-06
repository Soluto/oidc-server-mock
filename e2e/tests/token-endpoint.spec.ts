import * as querystring from 'querystring';
import * as dotenv from 'dotenv'
import axios from 'axios';
import { decode } from 'jws';

describe('Token Endpoint', () => {
  beforeAll(() => {
    dotenv.config();
  });

  test('Client Credentials', async () => {
    const { CLIENT_CREDENTIALS_CLIENT_ID, CLIENT_CREDENTIALS_CLIENT_SECRET, API_RESOURCE } = process.env;
    const parameters = {
      client_id: CLIENT_CREDENTIALS_CLIENT_ID,
      client_secret: CLIENT_CREDENTIALS_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: API_RESOURCE,
    };

    const response = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(parameters));

    expect(response).toBeDefined();
    expect(response.data.access_token).toBeDefined();
    const token = decode(response.data.access_token);

    expect(token).toMatchSnapshot();
  });
});
