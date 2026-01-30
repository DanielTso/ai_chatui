import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test('sidebar is visible', async ({ page }) => {
    await page.goto('/')
    // The sidebar should be present
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first()
    await expect(sidebar).toBeVisible()
  })

  test('new project button exists in sidebar', async ({ page }) => {
    await page.goto('/')
    // Look for a button that creates a new project
    const newProjectBtn = page.getByRole('button', { name: /new project|add project|create project/i })
    await expect(newProjectBtn).toBeVisible()
  })
})
