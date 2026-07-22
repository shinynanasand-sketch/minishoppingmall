import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../types'

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

export type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
}

const initialState: AuthState = {
  user: null,
  status: 'loading',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.status = action.payload ? 'authenticated' : 'unauthenticated'
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload
    },
    clearAuthError(state) {
      state.error = null
    },
  },
})

export const { setAuthUser, setAuthError, clearAuthError } = authSlice.actions

export default authSlice.reducer

type AuthRootState = {
  auth: AuthState
}

export const selectAuthUser = (state: AuthRootState): AuthUser | null =>
  state.auth.user
export const selectAuthStatus = (state: AuthRootState): AuthStatus =>
  state.auth.status
export const selectAuthError = (state: AuthRootState): string | null =>
  state.auth.error
