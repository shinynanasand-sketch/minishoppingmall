import { useEffect, useRef } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAppDispatch } from '../store'
import { setAuthUser } from '../store/slices/authSlice'
import { clearCart } from '../store/slices/cartSlice'
import type { AuthUser } from '../types'

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

/**
 * Subscribes once to Firebase auth state and mirrors it into the auth slice.
 * When a previously logged-in session ends (user -> null), the cart is cleared.
 * The very first guest load (null with no prior uid) keeps the guest cart.
 */
export function AuthListener() {
  const dispatch = useAppDispatch()
  const prevUidRef = useRef<string | null>(null)

  useEffect(() => {
    if (!auth) {
      dispatch(setAuthUser(null))
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        prevUidRef.current = firebaseUser.uid
        dispatch(setAuthUser(toAuthUser(firebaseUser)))
      } else {
        if (prevUidRef.current) {
          dispatch(clearCart())
        }
        prevUidRef.current = null
        dispatch(setAuthUser(null))
      }
    })

    return unsubscribe
  }, [dispatch])

  return null
}
