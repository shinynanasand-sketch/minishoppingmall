import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import cartReducer from './slices/cartSlice'
import authReducer from './slices/authSlice'
import { saveCartItems } from './cartStorage'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
})

store.subscribe(() => {
  saveCartItems(store.getState().cart.items)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
