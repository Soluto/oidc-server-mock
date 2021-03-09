import * as querystring from 'querystring';
import axios, { AxiosRequestConfig } from 'axios';
import apiResources from '../config/api-resources.json';

export default async (
  token: string,
  apiResourceId: string,
  snapshotPropertyMatchers: Record<string, unknown> = {}
): Promise<void> => {
  const apiResource = apiResources.find(aR => aR.Name === apiResourceId);
  expect(apiResource).toBeDefined();
  const auth = Buffer.from(`${apiResource.Name}:${apiResource.ApiSecrets?.[0]}`).toString('base64');
  const requestConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  const requestBody = querystring.stringify({
    token,
  });

  const response = await axios.post(process.env.OIDC_INTROSPECTION_URL, requestBody, requestConfig);

  expect(response).toBeDefined();
  expect(response.data).toMatchSnapshot(snapshotPropertyMatchers);
};
