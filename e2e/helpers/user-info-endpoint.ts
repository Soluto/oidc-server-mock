import axios from 'axios';

export default async (token: string): Promise<void> => {
  const response = await axios.get(process.env.OIDC_USERINFO_URL, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(response.data).toMatchSnapshot();
};
