import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestDb, testDb } from '../../helpers/test-db'

vi.mock('@/db', () => ({
  get db() {
    return testDb
  },
}))

import {
  createProject,
  getProjects,
  deleteProject,
  updateProjectName,
} from '@/app/actions'

describe('project actions', () => {
  beforeEach(() => {
    createTestDb()
  })

  it('creates a project and returns it', async () => {
    const [project] = await createProject('My Project')
    expect(project).toMatchObject({ name: 'My Project' })
    expect(project.id).toBeDefined()
  })

  it('lists all projects', async () => {
    await createProject('A')
    await createProject('B')
    const projects = await getProjects()
    expect(projects).toHaveLength(2)
  })

  it('deletes a project', async () => {
    const [project] = await createProject('To Delete')
    await deleteProject(project.id)
    const projects = await getProjects()
    expect(projects).toHaveLength(0)
  })

  it('cascade-deletes chats when project is deleted', async () => {
    const { createChat, getChats } = await import('@/app/actions')
    const [project] = await createProject('With Chats')
    await createChat(project.id, 'Chat 1')
    await createChat(project.id, 'Chat 2')
    // Verify chats exist
    const chatsBefore = await getChats(project.id)
    expect(chatsBefore).toHaveLength(2)
    // Delete project
    await deleteProject(project.id)
    // Chats should be gone
    const chatsAfter = await getChats(project.id)
    expect(chatsAfter).toHaveLength(0)
  })

  it('updates project name', async () => {
    const [project] = await createProject('Old Name')
    const [updated] = await updateProjectName(project.id, 'New Name')
    expect(updated.name).toBe('New Name')
  })
})
