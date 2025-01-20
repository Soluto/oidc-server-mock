import { expect } from '@jest/globals';
import { Page } from 'playwright-chromium';

import { User } from '../types';
import { oidcAuthorizeUrl } from './endpoints';

const authorizationEndpoint = async (
  page: Page,
  parameters: URLSearchParams,
  user: User,
  redirect_uri: string,
): Promise<URL> => {
  const url = `${oidcAuthorizeUrl.href}?${parameters.toString()}`;
  const response = await page.goto(url);
  expect(response.ok()).toBe(true);

  await page.waitForSelector('[id=Input_Username]');
  await page.type('[id=Input_Username]', user.Username);
  await page.type('[id=Input_Password]', user.Password);
  await page.keyboard.press('Enter');
  await page.waitForURL(url => url.origin === redirect_uri);
  const redirectedUrl = new URL(page.url());
  return redirectedUrl;
};

export default authorizationEndpoint;
