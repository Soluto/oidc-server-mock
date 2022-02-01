import * as querystring from 'querystring';

import axios from 'axios';
import { decode as decodeJWT } from 'jws';

export default async (
  parameters: querystring.ParsedUrlQueryInput,
  snapshotPropertyMatchers: Record<string, unknown> = {}
): Promise<string> => {
  const tokenEndpointResponse = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(parameters));

  expect(tokenEndpointResponse?.data?.access_token).toBeDefined();
  const token = tokenEndpointResponse.data.access_token;
  const decodedToken = decodeJWT(token);

  expect(decodedToken).toMatchSnapshot(snapshotPropertyMatchers);
  return token as string;
};
