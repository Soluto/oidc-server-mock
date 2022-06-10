import { Agent } from 'https';

import fetch from 'node-fetch';

export default async (token: string, snapshotPropertyMatchers: Record<string, unknown> = {}): Promise<void> => {
  const response = await fetch(process.env.OIDC_USERINFO_URL, {
    headers: { authorization: `Bearer ${token}` },
    agent: new Agent({ rejectUnauthorized: false }),
  });
  const result = await response.json();
  expect(result).toMatchSnapshot(snapshotPropertyMatchers);
};
