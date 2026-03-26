import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import articles from '../test-data/articles.json'

test.beforeEach(async ({page}) => {

  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags) })
  })

  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = 'First title replacement test'
    responseBody.articles[0].description = 'The new article description'

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })
  
  await page.goto('https://conduit.bondaracademy.com/');
})

test('has title', async ({ page }) => {
  
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toHaveText('First title replacement test')
  await expect(page.locator('app-article-list p').first()).toContainText('The new article description')

});
