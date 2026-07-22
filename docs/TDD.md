# TDD — 데이터 / 타입 설계 문서

| 항목 | 내용 |
|------|------|
| 문서명 | Technical Design Document (Data Schema) |
| 관련 문서 | [PRD.md](./PRD.md), [SRD.md](./SRD.md), [TRD.md](./TRD.md) |
| 구현 파일 | `src/types.ts`, `src/data/products.ts`, `src/store/slices/cartSlice.ts`, `src/store/slices/authSlice.ts` |
| API | `https://fakestoreapi.com/products` |
| 버전 | 3.2 |

---

## 1. 설계 원칙

- **정규화**: `CartItem`에 제목·가격·이미지 미저장.
- **단일 스키마**: API 응답과 `mockProducts`가 같은 `Product` 타입을 사용한다.
- **폴백 대체**: 실패 시 `products` state를 mock으로 **교체**한다 (병합 아님).
- **id 충돌 방지**: mock `id`는 `9001`~`9004` 대역을 사용해 FakeStore(1~20)와 구분한다.
- **상태 분리**: cart(`cartSlice`)와 auth(`authSlice`)는 별도 slice로 두고 서로 필드를 복사하지 않는다. 단 로그아웃 전이 시에는 `clearCart`를 트리거한다.
- **직렬화 안전**: Firebase `User` 원본이 아니라 평범한 `AuthUser`만 store에 저장한다.
- **파생 총액·총수량**: `totalPrice` / `totalQuantity`를 Redux state에 두지 않고 selector로 계산한다.

---

## 2. 타입 스키마

### Product

```ts
export type Product = {
  id: number
  title: string
  price: number
  description: string
  image: string
}
```

### CartItem

```ts
export type CartItem = {
  productId: number
  quantity: number
}
```

### AuthUser

```ts
export type AuthUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}
```

화면에는 `displayName` 우선, 없으면 마스킹된 `email`을 표시한다. UID 전체 노출·캡처 금지를 권장한다.

---

## 3. Redux auth 상태

```ts
type AuthState = {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null
}
```

| Action | payload | 결과 |
|--------|---------|------|
| `setAuthUser` | `AuthUser | null` | `user` 갱신, `status`를 authenticated/unauthenticated로 |
| `setAuthLoading` | 없음 | `status = 'loading'` |
| `setAuthError` | `string` | 로그인 실패 메시지 |
| `clearAuthError` | 없음 | `error = null` |

`AuthListener`가 `onAuthStateChanged` 콜백에서 위 action을 dispatch하고, 직전 uid가 있던 상태에서 `null`로 전이하면 `clearCart`도 함께 dispatch한다.

---

## 4. Redux cart 상태

```ts
type CartState = {
  items: CartItem[]
}
```

| Action | payload | 결과 |
|--------|---------|------|
| `addToCart` | `productId: number` | upsert (기존 +1 / 신규 quantity 1) |
| `increaseQuantity` | `productId: number` | quantity +1 |
| `decreaseQuantity` | `productId: number` | 1이면 제거, 아니면 -1 |
| `removeFromCart` | `productId: number` | 해당 항목 삭제 |
| `clearCart` | 없음 | `items = []` |

### Selectors (파생 값)

| Selector | 식 | 비고 |
|----------|-----|------|
| `selectCartItems` | `state.cart.items` | 원본 |
| `selectTotalQuantity` | `Σ quantity` | state에 저장하지 않음 |
| `selectTotalPrice(state, products)` | `Σ price × quantity` | `products`는 App 마스터 |

총액·총수량은 `createSelector`(reselect 패턴)로 메모이즈한다.

---

## 5. 데이터 소스

| 상황 | `products` 내용 | `error` |
|------|-----------------|--------|
| API 성공 | FakeStore 배열 | `null` |
| API 실패 | `mockProducts` | `'오류 발생'` |

### mockProducts (`src/data/products.ts`)

| id | title | price |
|----|-------|-------|
| 9001 | 무선 이어폰 (로컬) | 89000 |
| 9002 | 노트북 스탠드 (로컬) | 35000 |
| 9003 | 기계식 키보드 (로컬) | 129000 |
| 9004 | USB-C 허브 (로컬) | 45000 |

---

## 6. 관계 · 총액

`CartItem.productId` ≡ 현재 `products` 배열의 `Product.id`.  
총액: `Σ price × quantity` (파생 값, `selectTotalPrice`).  
총수량: `Σ quantity` (파생 값, `selectTotalQuantity`).

표시 조인: `product.title`, `product.image`, `product.price`.
