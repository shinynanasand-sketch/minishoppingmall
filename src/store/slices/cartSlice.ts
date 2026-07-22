import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { CartItem, Product } from '../../types'
import { loadCartItems } from '../cartStorage'

export type CartState = {
  items: CartItem[]
}

/** Store root shape needed by cart selectors (avoids circular import with store/index). */
type CartRootState = {
  cart: CartState
}

const initialState: CartState = {
  items: loadCartItems(),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<number>) {
      const productId = action.payload
      const existing = state.items.find((item) => item.productId === productId)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ productId, quantity: 1 })
      }
    },
    increaseQuantity(state, action: PayloadAction<number>) {
      const productId = action.payload
      const target = state.items.find((item) => item.productId === productId)
      if (target) {
        target.quantity += 1
      }
    },
    decreaseQuantity(state, action: PayloadAction<number>) {
      const productId = action.payload
      const target = state.items.find((item) => item.productId === productId)
      if (!target) return
      if (target.quantity === 1) {
        state.items = state.items.filter((item) => item.productId !== productId)
      } else {
        target.quantity -= 1
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      const productId = action.payload
      state.items = state.items.filter((item) => item.productId !== productId)
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer

export const selectCartItems = (state: CartRootState): CartItem[] =>
  state.cart.items

export const selectTotalQuantity = createSelector(
  [selectCartItems],
  (items): number => items.reduce((sum, item) => sum + item.quantity, 0),
)

export const selectTotalPrice = createSelector(
  [
    selectCartItems,
    (_state: CartRootState, products: Product[]): Product[] => products,
  ],
  (items, products): number =>
    items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + (product?.price ?? 0) * item.quantity
    }, 0),
)
