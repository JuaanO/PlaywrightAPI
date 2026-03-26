import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import articles from '../test-data/articles.json'

test.beforeEach(async ({page}) => {

  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags) })
  })

  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Sign In').click()
  await page.getByRole('textbox', {name: 'Email'}).fill('juan@jose.es')
  await page.getByRole('textbox', {name: 'Password'}).fill('contrasena1')
  await page.getByRole('button', {name: 'Sign In'}).click()
})

test('has title', async ({ page }) => {
  
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = 'First title replacement MOCK test'
    responseBody.articles[0].description = 'The new article MOCK description'

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toHaveText('First title replacement MOCK test')
  await expect(page.locator('app-article-list p').first()).toContainText('The new article MOCK description')

});


test('Delete an article', async ({page, request}) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {"user":{"email":"juan@jose.es","password":"contrasena1"}}
  })

  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{"title":"Creation of new article","description":"test new article","body":"this is a test for a new article","tagList":["newarticle"]}
    }, 
    headers: { 
      Authorization: `Token ${accessToken}`
    }
  }
)
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('Creation of new article').click()
  await page.getByRole('button', {name: 'Delete Article'}).first().click()
  await page.getByText('Global Feed').click()
  
  await expect(page.locator('app-article-list h1').first()).not.toContainText('Creation of new article')

})

test('Create an article', async ({page, request}) =>{

  await page.getByRole('link', {name: ' New Article'}).click()
  await page.getByPlaceholder('Article Title').fill('Title of the new article to create')
  await page.getByPlaceholder('What\'s this article about?').fill('Is about create one article with playwright')
  await page.getByPlaceholder('Write your article (in markdown)').fill('Playwright is awesome and easy to learn')
  await page.getByPlaceholder('Enter tags').fill('firstTag')
  await page.getByRole('button', {name: 'Publish Article'}).click()

  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('app-article-page h1')).toContainText('Title of the new article to create')
  await page.getByText('Home').click()
  // await page.getByText('Global Feed').click()
  
  await expect(page.locator('app-article-list h1').first()).toContainText('Title of the new article to create')

  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {"user":{"email":"juan@jose.es","password":"contrasena1"}}
  })

  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`,{
    headers: { 
      Authorization: `Token ${accessToken}`
    } 
  })

  expect(deleteArticleResponse.status()).toEqual(204)
})