import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestDb, testDb } from '../../helpers/test-db'

vi.mock('@/db', () => ({
  get db() {
    return testDb
  },
}))

import {
  createProject,
  createChat,
  createStandaloneChat,
  getChats,
  getStandaloneChats,
  getAllProjectChats,
  archiveChat,
  restoreChat,
  moveChatToProject,
  updateChatTitle,
  deleteChat,
  getArchivedChats,
} from '@/app/actions'

describe('chat actions', () => {
  beforeEach(() => {
    createTestDb()
  })

  it('creates a chat in a project', async () => {
    const [project] = await createProject('P')
    const [chat] = await createChat(project.id, 'Chat 1')
    expect(chat).toMatchObject({ title: 'Chat 1', projectId: project.id })
  })

  it('creates a standalone chat (no project)', async () => {
    const [chat] = await createStandaloneChat('Standalone')
    expect(chat.title).toBe('Standalone')
    expect(chat.projectId).toBeNull()
  })

  it('getChats filters by project and excludes archived', async () => {
    const [project] = await createProject('P')
    const [chat1] = await createChat(project.id, 'Active')
    const [chat2] = await createChat(project.id, 'Archived')
    await archiveChat(chat2.id)

    const chats = await getChats(project.id)
    expect(chats).toHaveLength(1)
    expect(chats[0].title).toBe('Active')
  })

  it('getStandaloneChats returns only non-archived chats without project', async () => {
    await createStandaloneChat('Solo 1')
    const [solo2] = await createStandaloneChat('Solo 2')
    await archiveChat(solo2.id)

    const chats = await getStandaloneChats()
    expect(chats).toHaveLength(1)
    expect(chats[0].title).toBe('Solo 1')
  })

  it('getAllProjectChats returns non-archived chats with projectId', async () => {
    const [project] = await createProject('P')
    await createChat(project.id, 'Project Chat')
    await createStandaloneChat('Solo')

    const chats = await getAllProjectChats()
    expect(chats).toHaveLength(1)
    expect(chats[0].title).toBe('Project Chat')
  })

  it('archives and restores a chat', async () => {
    const [project] = await createProject('P')
    const [chat] = await createChat(project.id, 'Chat')

    await archiveChat(chat.id)
    let archived = await getArchivedChats()
    expect(archived).toHaveLength(1)

    await restoreChat(chat.id)
    archived = await getArchivedChats()
    expect(archived).toHaveLength(0)
  })

  it('moves a chat to another project', async () => {
    const [p1] = await createProject('P1')
    const [p2] = await createProject('P2')
    const [chat] = await createChat(p1.id, 'Movable')

    const [moved] = await moveChatToProject(chat.id, p2.id)
    expect(moved.projectId).toBe(p2.id)
  })

  it('moves a chat to standalone (null project)', async () => {
    const [project] = await createProject('P')
    const [chat] = await createChat(project.id, 'Chat')
    const [moved] = await moveChatToProject(chat.id, null)
    expect(moved.projectId).toBeNull()
  })

  it('updates chat title', async () => {
    const [project] = await createProject('P')
    const [chat] = await createChat(project.id, 'Old')
    const [updated] = await updateChatTitle(chat.id, 'New')
    expect(updated.title).toBe('New')
  })

  it('deletes a chat', async () => {
    const [project] = await createProject('P')
    const [chat] = await createChat(project.id, 'To Delete')
    await deleteChat(chat.id)
    const chats = await getChats(project.id)
    expect(chats).toHaveLength(0)
  })
})
