import axios from 'axios';

export default async (token: string, snapshotPropertyMatchers: Record<string, unknown> = {}): Promise<void> => {
  const response = await axios.get(process.env.OIDC_USERINFO_URL, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(response.data).toMatchSnapshot(snapshotPropertyMatchers);
};
