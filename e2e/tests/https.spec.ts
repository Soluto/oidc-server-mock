import { Agent } from 'https';

import axios from 'axios';
import * as dotenv from 'dotenv';

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
