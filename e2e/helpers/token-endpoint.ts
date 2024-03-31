import { Agent } from 'https';

import { decode as decodeJWT } from 'jws';
import fetch from 'node-fetch';

export default async (
  parameters: URLSearchParams,
  snapshotPropertyMatchers: Record<string, unknown> = {},
): Promise<string> => {
  const tokenEndpointResponse = await fetch(process.env.OIDC_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters.toString(),
    agent: new Agent({ rejectUnauthorized: false }),
  });
  const result = await tokenEndpointResponse.json();
  expect(result.access_token).toBeDefined();
  const token = result.access_token;
  const decodedToken = decodeJWT(token);

  expect(decodedToken).toMatchSnapshot(snapshotPropertyMatchers);
  return token as string;
};
