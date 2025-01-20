import { expect } from '@jest/globals';
import { decode as decodeJWT } from 'jws';
import { oidcTokenUrl } from './endpoints';

const tokenEndpoint = async (
  parameters: URLSearchParams,
  snapshotPropertyMatchers: Record<string, unknown> = {},
): Promise<string> => {
  const response = await fetch(oidcTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters.toString(),
  });
  expect(response.ok).toBe(true);
  const result = (await response.json()) as { access_token: string };
  expect(result.access_token).toBeDefined();
  const token = result.access_token;
  const decodedToken = decodeJWT(token);

  expect(decodedToken).toMatchSnapshot(snapshotPropertyMatchers);
  return token;
};

export default tokenEndpoint;
