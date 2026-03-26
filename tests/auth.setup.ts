import {test as setup} from '@playwright/test';

const authFile = '.auth/user.json'

setup('Authentication', async ({page}) => {

    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText('Sign In').click()
    await page.getByRole('textbox', {name: 'Email'}).fill('juan@jose.es')
    await page.getByRole('textbox', {name: 'Password'}).fill('contrasena1')
    await page.getByRole('button', {name: 'Sign In'}).click()

    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')
    await page.context().storageState({path: authFile})

})