import { expect } from '@jest/globals';
import { oidcUserInfoUrl } from './endpoints';

const userInfoEndpoint = async (
  token: string,
  snapshotPropertyMatchers: Record<string, unknown> = {},
): Promise<void> => {
  const response = await fetch(oidcUserInfoUrl, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(response.ok).toBe(true);
  const result = (await response.json()) as unknown;
  expect(result).toMatchSnapshot(snapshotPropertyMatchers);
};

export default userInfoEndpoint;
