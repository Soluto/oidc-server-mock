import { Page } from 'playwright-chromium';

import { User } from '../types';

export default async (page: Page, user: User): Promise<void> => {
  const response = await page.goto(process.env.OIDC_GRANTS_URL);
  expect(response.ok()).toBeTruthy();

  await page.waitForSelector('[id=Input_Username]');
  await page.type('[id=Input_Username]', user.Username);
  await page.type('[id=Input_Password]', user.Password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  expect(await page.content()).toMatchSnapshot();
};
