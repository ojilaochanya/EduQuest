import { describe, it, expect, beforeEach } from 'vitest'

type Quest = {
  owner: string
  title: string
  reward: bigint
  completedBy: string[]
}

type CompletionKey = string // "questId:user"

const mockContract = {
  admin: 'ST1ADMIN111111111111111111111111111111111',
  nextId: 1,
  quests: new Map<number, Quest>(),
  completions: new Set<CompletionKey>(),

  isAdmin(sender: string) {
    return sender === this.admin
  },

  createQuest(sender: string, title: string, reward: bigint) {
    if (reward <= 0n) return { error: 104 }
    const quest: Quest = {
      owner: sender,
      title,
      reward,
      completedBy: []
    }
    this.quests.set(this.nextId, quest)
    return { value: this.nextId++ }
  },

  completeQuest(sender: string, questId: number) {
    const quest = this.quests.get(questId)
    if (!quest) return { error: 101 }

    const key = `${questId}:${sender}`
    if (this.completions.has(key)) return { error: 102 }

    this.completions.add(key)
    quest.completedBy.push(sender)
    return { value: true }
  },

  updateReward(sender: string, questId: number, reward: bigint) {
    if (!this.isAdmin(sender)) return { error: 100 }
    const quest = this.quests.get(questId)
    if (!quest) return { error: 101 }

    quest.reward = reward
    return { value: true }
  },

  getQuest(questId: number): Quest | undefined {
    return this.quests.get(questId)
  },

  hasCompleted(questId: number, user: string) {
    return this.completions.has(`${questId}:${user}`)
  }
}

describe('QuestManager Contract', () => {
  beforeEach(() => {
    mockContract.nextId = 1
    mockContract.quests.clear()
    mockContract.completions.clear()
  })

  it('should create a quest', () => {
    const result = mockContract.createQuest('STPLAYER123', 'Learn Blockchain', 100n)
    expect(result.value).toBe(1)
    const quest = mockContract.getQuest(1)
    expect(quest?.title).toBe('Learn Blockchain')
    expect(quest?.reward).toBe(100n)
  })

  it('should not create quest with 0 reward', () => {
    const result = mockContract.createQuest('STPLAYER123', 'Zero Reward', 0n)
    expect(result).toEqual({ error: 104 })
  })

  it('should complete a quest', () => {
    mockContract.createQuest('STPLAYER123', 'Math Challenge', 200n)
    const result = mockContract.completeQuest('STPLAYER456', 1)
    expect(result).toEqual({ value: true })
    const quest = mockContract.getQuest(1)
    expect(quest?.completedBy.includes('STPLAYER456')).toBe(true)
  })

  it('should not allow duplicate completion', () => {
    mockContract.createQuest('STPLAYER123', 'Repeat Challenge', 150n)
    mockContract.completeQuest('STPLAYER456', 1)
    const result = mockContract.completeQuest('STPLAYER456', 1)
    expect(result).toEqual({ error: 102 })
  })

  it('should not complete non-existent quest', () => {
    const result = mockContract.completeQuest('STPLAYER456', 99)
    expect(result).toEqual({ error: 101 })
  })

  it('should update reward as admin', () => {
    mockContract.createQuest('STPLAYER123', 'Update Reward', 300n)
    const result = mockContract.updateReward('ST1ADMIN111111111111111111111111111111111', 1, 500n)
    expect(result).toEqual({ value: true })
    const quest = mockContract.getQuest(1)
    expect(quest?.reward).toBe(500n)
  })

  it('should fail reward update from non-admin', () => {
    mockContract.createQuest('STPLAYER123', 'Fail Update', 300n)
    const result = mockContract.updateReward('STHACKER', 1, 999n)
    expect(result).toEqual({ error: 100 })
  })

  it('should detect completion', () => {
    mockContract.createQuest('STPLAYER123', 'Detect Complete', 120n)
    mockContract.completeQuest('STPLAYER456', 1)
    const completed = mockContract.hasCompleted(1, 'STPLAYER456')
    expect(completed).toBe(true)
  })
})
