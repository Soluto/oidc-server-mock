import * as querystring from 'querystring';

import { Page } from 'playwright-chromium';

import { User } from '../types';

export default async (
  page: Page,
  parameters: querystring.ParsedUrlQueryInput,
  user: User,
  redirect_uri: string
): Promise<URL> => {
  const url = `${process.env.OIDC_AUTHORIZE_URL}?${querystring.stringify(parameters)}`;
  const response = await page.goto(url);
  expect(response.ok()).toBeTruthy();

  await page.waitForSelector('#Username');
  await page.type('#Username', user.Username);
  await page.type('#Password', user.Password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  const redirectedUrl = new URL(page.url());
  expect(redirectedUrl.origin).toEqual(redirect_uri);
  return redirectedUrl;
};
