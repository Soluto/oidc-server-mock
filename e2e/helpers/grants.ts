import { expect } from '@jest/globals';
import { Page } from 'playwright-chromium';

import { User } from '../types';
import { oidcGrantsUrl } from './endpoints';

const grantsEndpoint = async (page: Page, user: User): Promise<void> => {
  const response = await page.goto(oidcGrantsUrl.href);
  expect(response.ok()).toBe(true);

  await page.waitForSelector('[id=Input_Username]');
  await page.type('[id=Input_Username]', user.Username);
  await page.type('[id=Input_Password]', user.Password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  expect(await page.content()).toMatchSnapshot();
};

export default grantsEndpoint;
