import { Agent } from 'https';

import fetch from 'node-fetch';

import apiResources from '../config/api-resources.json';

export default async (
  token: string,
  apiResourceId: string,
  snapshotPropertyMatchers: Record<string, unknown> = {}
): Promise<void> => {
  const apiResource = apiResources.find(aR => aR.Name === apiResourceId);
  expect(apiResource).toBeDefined();
  const auth = Buffer.from(`${apiResource.Name}:${apiResource.ApiSecrets?.[0]}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const requestBody = new URLSearchParams({
    token,
  });

  const response = await fetch(process.env.OIDC_INTROSPECTION_URL, {
    method: 'POST',
    body: requestBody,
    headers,
    agent: new Agent({ rejectUnauthorized: false }),
  });

  expect(response).toBeDefined();
  const result = await response.json();
  expect(result).toMatchSnapshot(snapshotPropertyMatchers);
};
