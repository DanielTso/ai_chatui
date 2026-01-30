import { test, expect } from '@playwright/test'

test.describe('Chat Flow', () => {
  test('app loads and shows textarea', async ({ page }) => {
    await page.goto('/')
    const textarea = page.getByPlaceholder(/select a chat|type a message/i)
    await expect(textarea).toBeVisible()
  })

  test('can create a chat and type in the textarea', async ({ page }) => {
    await page.goto('/')
    // Textarea is disabled until a chat is selected — create one first
    const newChatBtn = page.getByRole('button', { name: /New Chat/i })
    await newChatBtn.click()
    // Now the textarea should be enabled
    const textarea = page.getByPlaceholder(/type a message/i)
    await expect(textarea).toBeEnabled()
    await textarea.fill('Hello, world!')
    await expect(textarea).toHaveValue('Hello, world!')
  })

  test('send button is visible after creating a chat', async ({ page }) => {
    await page.goto('/')
    const newChatBtn = page.getByRole('button', { name: /New Chat/i })
    await newChatBtn.click()
    // The send button should exist in the form area
    const sendButton = page.locator('button[type="submit"], button:has(svg)').last()
    await expect(sendButton).toBeVisible()
  })
})
