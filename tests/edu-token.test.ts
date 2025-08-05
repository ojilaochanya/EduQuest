import { describe, it, expect, beforeEach } from 'vitest'

type Balances = Map<string, bigint>
type Authorized = Set<string>

const ZERO_ADDRESS = 'SP000000000000000000002Q6VF78'

const mockContract = {
  admin: 'STADMIN',
  paused: false,
  totalSupply: 0n,
  MAX_SUPPLY: 100_000_000_000_000n,
  balances: new Map<string, bigint>() as Balances,
  minters: new Set<string>() as Authorized,

  isAdmin(sender: string) {
    return sender === this.admin
  },

  setPaused(sender: string, pause: boolean) {
    if (!this.isAdmin(sender)) return { error: 100 }
    this.paused = pause
    return { value: pause }
  },

  addMinter(sender: string, who: string) {
    if (!this.isAdmin(sender)) return { error: 100 }
    this.minters.add(who)
    return { value: true }
  },

  removeMinter(sender: string, who: string) {
    if (!this.isAdmin(sender)) return { error: 100 }
    this.minters.delete(who)
    return { value: true }
  },

  mint(sender: string, to: string, amount: bigint) {
    if (!this.minters.has(sender)) return { error: 100 }
    if (to === ZERO_ADDRESS) return { error: 101 }
    if (this.totalSupply + amount > this.MAX_SUPPLY) return { error: 104 }

    this.totalSupply += amount
    this.balances.set(to, (this.balances.get(to) || 0n) + amount)
    return { value: true }
  },

  transfer(sender: string, to: string, amount: bigint) {
    if (this.paused) return { error: 103 }
    if (to === ZERO_ADDRESS) return { error: 101 }
    const senderBal = this.balances.get(sender) || 0n
    if (senderBal < amount) return { error: 102 }

    this.balances.set(sender, senderBal - amount)
    this.balances.set(to, (this.balances.get(to) || 0n) + amount)
    return { value: true }
  },

  burn(sender: string, amount: bigint) {
    if (this.paused) return { error: 103 }
    const bal = this.balances.get(sender) || 0n
    if (bal < amount) return { error: 102 }

    this.balances.set(sender, bal - amount)
    this.totalSupply -= amount
    return { value: true }
  },

  getBalance(owner: string) {
    return this.balances.get(owner) || 0n
  }
}

describe('EduToken Contract', () => {
  beforeEach(() => {
    mockContract.balances.clear()
    mockContract.minters.clear()
    mockContract.totalSupply = 0n
    mockContract.paused = false
    mockContract.minters.add('STMINTER')
  })

  it('should allow authorized minter to mint tokens', () => {
    const result = mockContract.mint('STMINTER', 'STUSER1', 5000n)
    expect(result).toEqual({ value: true })
    expect(mockContract.getBalance('STUSER1')).toBe(5000n)
  })

  it('should not allow unauthorized mint', () => {
    const result = mockContract.mint('STHACKER', 'STUSER1', 1000n)
    expect(result).toEqual({ error: 100 })
  })

  it('should prevent mint over max supply', () => {
    const result = mockContract.mint('STMINTER', 'STUSER1', 200_000_000_000_000n)
    expect(result).toEqual({ error: 104 })
  })

  it('should allow transfer between users', () => {
    mockContract.mint('STMINTER', 'STUSER1', 1000n)
    const result = mockContract.transfer('STUSER1', 'STUSER2', 500n)
    expect(result).toEqual({ value: true })
    expect(mockContract.getBalance('STUSER1')).toBe(500n)
    expect(mockContract.getBalance('STUSER2')).toBe(500n)
  })

  it('should fail transfer if balance insufficient', () => {
    const result = mockContract.transfer('STUSER1', 'STUSER2', 999n)
    expect(result).toEqual({ error: 102 })
  })

  it('should burn tokens correctly', () => {
    mockContract.mint('STMINTER', 'STUSER1', 1000n)
    const result = mockContract.burn('STUSER1', 400n)
    expect(result).toEqual({ value: true })
    expect(mockContract.getBalance('STUSER1')).toBe(600n)
    expect(mockContract.totalSupply).toBe(600n)
  })

  it('should pause contract and block transfer', () => {
    mockContract.setPaused('STADMIN', true)
    const result = mockContract.transfer('STUSER1', 'STUSER2', 100n)
    expect(result).toEqual({ error: 103 })
  })

  it('should only allow admin to add minter', () => {
    const result = mockContract.addMinter('STHACKER', 'STFAKE')
    expect(result).toEqual({ error: 100 })
  })
})
