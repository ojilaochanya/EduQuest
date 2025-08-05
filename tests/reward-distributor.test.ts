import { describe, it, expect, beforeEach } from 'vitest'

type RewardEvent = {
  recipient: string
  ftContract?: string
  ftAmount?: bigint
  nftContract?: string
  nftId?: number
  claimed: boolean
}

const mockContract = {
  admin: 'STADMIN',
  rewards: new Map<number, RewardEvent>(),

  isAdmin(sender: string) {
    return sender === this.admin
  },

  registerReward(sender: string, eventId: number, reward: RewardEvent) {
    if (!this.isAdmin(sender)) return { error: 100 }
    this.rewards.set(eventId, { ...reward, claimed: false })
    return { value: true }
  },

  claimReward(sender: string, eventId: number) {
    const reward = this.rewards.get(eventId)
    if (!reward) return { error: 101 }
    if (reward.recipient !== sender) return { error: 100 }
    if (reward.claimed) return { error: 102 }

    reward.claimed = true
    this.rewards.set(eventId, reward)
    return { value: true }
  },

  isClaimed(eventId: number) {
    return this.rewards.get(eventId)?.claimed ?? false
  }
}

describe('RewardDistributor Contract', () => {
  beforeEach(() => {
    mockContract.rewards.clear()
  })

  it('should register a reward event', () => {
    const result = mockContract.registerReward('STADMIN', 1, {
      recipient: 'STUSER1',
      ftContract: 'FT1',
      ftAmount: 1000n,
      claimed: false
    })
    expect(result).toEqual({ value: true })
    expect(mockContract.rewards.get(1)?.recipient).toBe('STUSER1')
  })

  it('should not allow non-admin to register reward', () => {
    const result = mockContract.registerReward('STHACKER', 1, {
      recipient: 'STUSER1',
      claimed: false
    })
    expect(result).toEqual({ error: 100 })
  })

  it('should allow recipient to claim reward', () => {
    mockContract.registerReward('STADMIN', 2, {
      recipient: 'STUSER1',
      ftAmount: 500n,
      claimed: false
    })

    const result = mockContract.claimReward('STUSER1', 2)
    expect(result).toEqual({ value: true })
    expect(mockContract.rewards.get(2)?.claimed).toBe(true)
  })

  it('should not allow wrong user to claim', () => {
    mockContract.registerReward('STADMIN', 3, {
      recipient: 'STUSER2',
      claimed: false
    })

    const result = mockContract.claimReward('STUSER1', 3)
    expect(result).toEqual({ error: 100 })
  })

  it('should not allow duplicate claims', () => {
    mockContract.registerReward('STADMIN', 4, {
      recipient: 'STUSER1',
      claimed: false
    })

    mockContract.claimReward('STUSER1', 4)
    const result = mockContract.claimReward('STUSER1', 4)
    expect(result).toEqual({ error: 102 })
  })

  it('should return claim status', () => {
    mockContract.registerReward('STADMIN', 5, {
      recipient: 'STUSER1',
      claimed: false
    })
    expect(mockContract.isClaimed(5)).toBe(false)

    mockContract.claimReward('STUSER1', 5)
    expect(mockContract.isClaimed(5)).toBe(true)
  })
})
