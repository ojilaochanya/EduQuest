import { describe, it, expect, beforeEach } from 'vitest'

type Profile = {
  username: string
  xp: bigint
  level: bigint
  reputation: number
}

const mockContract = {
  admin: 'STADMIN',
  profiles: new Map<string, Profile>(),
  usernames: new Map<string, string>(),

  isAdmin(sender: string) {
    return sender === this.admin
  },

  registerPlayer(sender: string, username: string) {
    if (this.profiles.has(sender)) return { error: 103 }
    if (this.usernames.has(username)) return { error: 101 }

    this.profiles.set(sender, {
      username,
      xp: 0n,
      level: 1n,
      reputation: 0
    })
    this.usernames.set(username, sender)
    return { value: true }
  },

  grantXP(sender: string, player: string, amount: bigint) {
    if (!this.isAdmin(sender)) return { error: 100 }
    const p = this.profiles.get(player)
    if (!p) return { error: 102 }

    const newXP = p.xp + amount
    const newLevel = 1n + newXP / 1000n
    this.profiles.set(player, { ...p, xp: newXP, level: newLevel })
    return { value: true }
  },

  adjustReputation(sender: string, player: string, delta: number) {
    if (!this.isAdmin(sender)) return { error: 100 }
    const p = this.profiles.get(player)
    if (!p) return { error: 102 }

    this.profiles.set(player, { ...p, reputation: p.reputation + delta })
    return { value: true }
  },

  getProfile(user: string) {
    return this.profiles.get(user)
  },

  getByUsername(username: string) {
    return this.usernames.get(username)
  }
}

describe('PlayerProfile Contract', () => {
  beforeEach(() => {
    mockContract.profiles.clear()
    mockContract.usernames.clear()
  })

  it('should register a player with unique username', () => {
    const result = mockContract.registerPlayer('STUSER1', 'alice')
    expect(result).toEqual({ value: true })
    expect(mockContract.getProfile('STUSER1')?.username).toBe('alice')
  })

  it('should not allow duplicate usernames', () => {
    mockContract.registerPlayer('STUSER1', 'alice')
    const result = mockContract.registerPlayer('STUSER2', 'alice')
    expect(result).toEqual({ error: 101 })
  })

  it('should not allow re-registering the same player', () => {
    mockContract.registerPlayer('STUSER1', 'alice')
    const result = mockContract.registerPlayer('STUSER1', 'bob')
    expect(result).toEqual({ error: 103 })
  })

  it('should grant XP and level up', () => {
    mockContract.registerPlayer('STUSER1', 'alice')
    const result = mockContract.grantXP('STADMIN', 'STUSER1', 2000n)
    expect(result).toEqual({ value: true })

    const profile = mockContract.getProfile('STUSER1')
    expect(profile?.xp).toBe(2000n)
    expect(profile?.level).toBe(3n) // 1 + floor(2000 / 1000)
  })

  it('should adjust reputation score', () => {
    mockContract.registerPlayer('STUSER1', 'alice')
    mockContract.adjustReputation('STADMIN', 'STUSER1', 5)
    const profile = mockContract.getProfile('STUSER1')
    expect(profile?.reputation).toBe(5)
  })

  it('should prevent non-admin XP grant', () => {
    mockContract.registerPlayer('STUSER1', 'alice')
    const result = mockContract.grantXP('STHACKER', 'STUSER1', 500n)
    expect(result).toEqual({ error: 100 })
  })
})
