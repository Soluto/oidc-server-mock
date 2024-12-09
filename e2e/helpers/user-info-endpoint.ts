import { expect } from '@jest/globals';

const userInfoEndpoint = async (
  token: string,
  snapshotPropertyMatchers: Record<string, unknown> = {},
): Promise<void> => {
  const response = await fetch(process.env.OIDC_USERINFO_URL, {
    headers: { authorization: `Bearer ${token}` },
  });
  const result = (await response.json()) as unknown;
  expect(result).toMatchSnapshot(snapshotPropertyMatchers);
};

export default userInfoEndpoint;
