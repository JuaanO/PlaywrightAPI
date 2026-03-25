import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.goto('https://conduit.bondaracademy.com/')
})

test('has title', async ({ page }) => {
  
  const title = await page.locator('.logo-font')
  expect(title).toHaveText('conduit')
});
