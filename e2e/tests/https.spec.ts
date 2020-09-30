import { Agent } from 'https';
import * as dotenv from 'dotenv';
import axios from 'axios';

describe('Https', () => {
  beforeAll(() => {
    dotenv.config();
  });

  test('Discovery Endpoint', async () => {
    const response = await axios.get(process.env.OIDC_DISCOVERY_ENDPOINT_HTTPS, {
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    });
    expect(Object.keys(response.data)).toMatchSnapshot();
  });
});
