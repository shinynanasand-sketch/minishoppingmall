import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CART_STORAGE_KEY,
  loadCartItems,
  saveCartItems,
} from './cartStorage'

describe('cartStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when nothing is stored', () => {
    expect(loadCartItems()).toEqual([])
  })

  it('round-trips valid cart items', () => {
    saveCartItems([{ productId: 3, quantity: 2 }])
    expect(localStorage.getItem(CART_STORAGE_KEY)).toContain('"productId":3')
    expect(loadCartItems()).toEqual([{ productId: 3, quantity: 2 }])
  })

  it('ignores invalid stored JSON', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{not-json')
    expect(loadCartItems()).toEqual([])
  })

  it('filters out malformed entries', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productId: 1, quantity: 1 },
        { productId: 'x', quantity: 1 },
        { productId: 2, quantity: 0 },
      ]),
    )
    expect(loadCartItems()).toEqual([{ productId: 1, quantity: 1 }])
  })

  it('swallows quota errors on save', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => saveCartItems([{ productId: 1, quantity: 1 }])).not.toThrow()
    spy.mockRestore()
  })
})
