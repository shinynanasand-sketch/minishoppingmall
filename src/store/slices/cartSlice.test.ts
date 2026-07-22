import { describe, expect, it } from 'vitest'
import cartReducer, {
  addToCart,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectTotalPrice,
  selectTotalQuantity,
} from './cartSlice'
import type { Product } from '../../types'

const products: Product[] = [
  {
    id: 1,
    title: 'A',
    price: 1000,
    description: '',
    image: '',
  },
  {
    id: 2,
    title: 'B',
    price: 2500,
    description: '',
    image: '',
  },
]

describe('cartSlice', () => {
  it('adds a new item and increments duplicates', () => {
    let state = cartReducer({ items: [] }, addToCart(1))
    expect(state.items).toEqual([{ productId: 1, quantity: 1 }])

    state = cartReducer(state, addToCart(1))
    expect(state.items).toEqual([{ productId: 1, quantity: 2 }])
  })

  it('increases and decreases quantity, removing at 1', () => {
    let state = cartReducer({ items: [] }, addToCart(1))
    state = cartReducer(state, increaseQuantity(1))
    expect(state.items[0]?.quantity).toBe(2)

    state = cartReducer(state, decreaseQuantity(1))
    expect(state.items[0]?.quantity).toBe(1)

    state = cartReducer(state, decreaseQuantity(1))
    expect(state.items).toEqual([])
  })

  it('removes and clears items', () => {
    let state = cartReducer({ items: [] }, addToCart(1))
    state = cartReducer(state, addToCart(2))
    state = cartReducer(state, removeFromCart(1))
    expect(state.items).toEqual([{ productId: 2, quantity: 1 }])

    state = cartReducer(state, clearCart())
    expect(state.items).toEqual([])
  })

  it('derives total quantity and price via selectors', () => {
    const root = {
      cart: {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      },
    }

    expect(selectTotalQuantity(root)).toBe(3)
    expect(selectTotalPrice(root, products)).toBe(1000 * 2 + 2500)
  })
})
