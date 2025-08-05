import { describe, it, expect, beforeEach } from 'vitest'

type ValidationKey = `${string}:${number}`

const mockContract = {
  admin: 'STADMIN',
  oracles: new Set<string>(),
  validations: new Map<ValidationKey, boolean>(),

  isOracle(sender: string) {
    return this.oracles.has(sender)
  },

  addOracle(sender: string, oracle: string) {
    if (sender !== this.admin) return { error: 100 }
    this.oracles.add(oracle)
    return { value: true }
  },

  removeOracle(sender: string, oracle: string) {
    if (sender !== this.admin) return { error: 100 }
    this.oracles.delete(oracle)
    return { value: true }
  },

  validateQuest(sender: string, user: string, questId: number) {
    const key = `${user}:${questId}` as ValidationKey
    if (!this.isOracle(sender)) return { error: 100 }
    if (this.validations.has(key)) return { error: 101 }
    this.validations.set(key, true)
    return { value: true }
  },

  isValidated(user: string, questId: number) {
    const key = `${user}:${questId}` as ValidationKey
    return this.validations.get(key) || false
  }
}

describe('QuestValidator Contract', () => {
  beforeEach(() => {
    mockContract.oracles.clear()
    mockContract.validations.clear()
  })

  it('should allow admin to add an oracle', () => {
    const result = mockContract.addOracle('STADMIN', 'STORACLE1')
    expect(result).toEqual({ value: true })
    expect(mockContract.isOracle('STORACLE1')).toBe(true)
  })

  it('should reject non-admin adding an oracle', () => {
    const result = mockContract.addOracle('STHACKER', 'STORACLE1')
    expect(result).toEqual({ error: 100 })
  })

  it('should validate quest by oracle', () => {
    mockContract.addOracle('STADMIN', 'STORACLE1')
    const result = mockContract.validateQuest('STORACLE1', 'STUSER1', 1)
    expect(result).toEqual({ value: true })
    expect(mockContract.isValidated('STUSER1', 1)).toBe(true)
  })

  it('should prevent duplicate quest validation', () => {
    mockContract.addOracle('STADMIN', 'STORACLE1')
    mockContract.validateQuest('STORACLE1', 'STUSER1', 1)
    const result = mockContract.validateQuest('STORACLE1', 'STUSER1', 1)
    expect(result).toEqual({ error: 101 })
  })

  it('should reject unauthorized validation attempts', () => {
    const result = mockContract.validateQuest('STNOTORACLE', 'STUSER1', 2)
    expect(result).toEqual({ error: 100 })
  })

  it('should remove oracle by admin', () => {
    mockContract.addOracle('STADMIN', 'STORACLE1')
    const result = mockContract.removeOracle('STADMIN', 'STORACLE1')
    expect(result).toEqual({ value: true })
    expect(mockContract.isOracle('STORACLE1')).toBe(false)
  })
})
