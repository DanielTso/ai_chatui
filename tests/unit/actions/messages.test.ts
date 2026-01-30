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
  saveMessage,
  getChatMessages,
  deleteMessage,
} from '@/app/actions'

describe('message actions', () => {
  let chatId: number

  beforeEach(async () => {
    await createTestDb()
    const [project] = await createProject('P')
    const [chat] = await createChat(project.id, 'Chat')
    chatId = chat.id
  })

  it('saves a message and returns it', async () => {
    const [msg] = await saveMessage(chatId, 'user', 'Hello')
    expect(msg).toMatchObject({ chatId, role: 'user', content: 'Hello' })
    expect(msg.id).toBeDefined()
  })

  it('returns all messages for a chat', async () => {
    await saveMessage(chatId, 'user', 'First')
    await saveMessage(chatId, 'assistant', 'Second')
    await saveMessage(chatId, 'user', 'Third')

    const msgs = await getChatMessages(chatId)
    expect(msgs).toHaveLength(3)
    const contents = msgs.map(m => m.content)
    expect(contents).toContain('First')
    expect(contents).toContain('Second')
    expect(contents).toContain('Third')
  })

  it('respects the limit parameter', async () => {
    for (let i = 0; i < 5; i++) {
      await saveMessage(chatId, 'user', `Message ${i}`)
    }

    const msgs = await getChatMessages(chatId, 3)
    expect(msgs).toHaveLength(3)
  })

  it('deletes a message', async () => {
    const [msg] = await saveMessage(chatId, 'user', 'To delete')
    await deleteMessage(msg.id)
    const msgs = await getChatMessages(chatId)
    expect(msgs).toHaveLength(0)
  })
})
