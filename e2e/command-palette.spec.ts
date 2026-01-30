import { test, expect } from '@playwright/test'

test.describe('Command Palette', () => {
  test('Ctrl+K opens command palette', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    // The command palette has a search input with this placeholder
    const searchInput = page.getByPlaceholder('Type a command or search...')
    await expect(searchInput).toBeVisible()
  })

  test('Ctrl+K toggles command palette closed', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    const searchInput = page.getByPlaceholder('Type a command or search...')
    await expect(searchInput).toBeVisible()

    // Ctrl+K again toggles it closed
    await page.keyboard.press('Control+k')
    await expect(searchInput).toBeHidden()
  })

  test('clicking backdrop closes command palette', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    const searchInput = page.getByPlaceholder('Type a command or search...')
    await expect(searchInput).toBeVisible()

    // Click the backdrop (top-left corner, away from the dialog)
    await page.mouse.click(10, 10)
    await expect(searchInput).toBeHidden()
  })
})
