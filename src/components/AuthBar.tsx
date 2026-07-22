import { FirebaseError } from 'firebase/app'
import { isFirebaseConfigured, loginWithGoogle, logout } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import {
  clearAuthError,
  selectAuthError,
  selectAuthUser,
  setAuthError,
} from '../store/slices/authSlice'

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const visible = local.slice(0, 2)
  return `${visible}***@${domain}`
}

function toAuthErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof FirebaseError) {
    if (err.code === 'auth/configuration-not-found') {
      return 'Firebase Authentication(Google)이 켜져 있지 않습니다. Console에서 Google 로그인을 사용 설정한 뒤 다시 시도하세요.'
    }
    if (err.code === 'auth/popup-closed-by-user') {
      return '로그인 창이 닫혔습니다. 다시 시도해 주세요.'
    }
    if (err.code === 'auth/unauthorized-domain') {
      return '이 도메인은 승인되지 않았습니다. Firebase Console → Authentication → Settings에서 localhost를 Authorized domains에 추가하세요.'
    }
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function AuthBar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const error = useAppSelector(selectAuthError)

  const handleLogin = async () => {
    dispatch(clearAuthError())
    try {
      await loginWithGoogle()
    } catch (err) {
      dispatch(setAuthError(toAuthErrorMessage(err, '로그인에 실패했습니다.')))
    }
  }

  const handleLogout = async () => {
    dispatch(clearAuthError())
    try {
      await logout()
    } catch (err) {
      dispatch(setAuthError(toAuthErrorMessage(err, '로그아웃에 실패했습니다.')))
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div
        role="status"
        className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Firebase 환경 변수가 없습니다. `.env.example`을 복사해 `.env`에 Web
        설정을 넣은 뒤 개발 서버를 재시작하세요. 상품·장바구니는 로그인 없이
        사용할 수 있습니다.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-stone-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {user ? (
          <>
            <div className="flex min-w-0 items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <p className="text-sm text-stone-700">
                <span className="font-medium text-stone-900">
                  {user.displayName ??
                    (user.email ? maskEmail(user.email) : '사용자')}
                </span>
                <span className="text-stone-500"> 님으로 로그인됨</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-600">
              로그인 없이도 상품을 담고 총액을 확인할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => void handleLogin()}
              className="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700"
            >
              Google로 로그인
            </button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
