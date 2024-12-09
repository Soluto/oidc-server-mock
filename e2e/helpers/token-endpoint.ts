import { expect } from '@jest/globals';
import { decode as decodeJWT } from 'jws';

const tokenEndpoint = async (
  parameters: URLSearchParams,
  snapshotPropertyMatchers: Record<string, unknown> = {},
): Promise<string> => {
  const tokenEndpointResponse = await fetch(process.env.OIDC_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters.toString(),
  });
  const result = (await tokenEndpointResponse.json()) as { access_token: string };
  expect(result.access_token).toBeDefined();
  const token = result.access_token;
  const decodedToken = decodeJWT(token);

  expect(decodedToken).toMatchSnapshot(snapshotPropertyMatchers);
  return token;
};

export default tokenEndpoint;
