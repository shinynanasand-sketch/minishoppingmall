# LearnNote — 미니 이커머스 장바구니

이 프로젝트로 **초급 개발자가 한 단계씩 성장한다**는 컨셉의 학습 노트입니다.  
단계가 끝날 때마다 이 파일을 이어서 업데이트합니다.

관련 문서: [PRD](./PRD.md) · [SRD](./SRD.md) · [TRD](./TRD.md) · [TDD](./TDD.md)

---

## 이 노트의 목적

- “무엇을 만들었는지”보다 **왜 이렇게 설계했는지**를 남긴다.
- 개념 → 이 프로젝트에서의 적용 → 짧은 코드 순으로 정리한다.
- 나중에 2단계, 3단계를 추가할 때 **같은 파일에 섹션만 쌓는다**.

---

## 학습 로드맵

| 단계 | 주제 | 상태 |
|------|------|------|
| 1단계 | 핵심 로직 및 로컬 데이터 (`useState`, Props, 파생 값, 정규화) | 완료 |
| 2단계 | FakeStore API 연동 + mock 폴백 (`useEffect`, fetch, loading/error) | 완료 |
| 3단계 | Redux Toolkit 전역 장바구니 + Firebase Google Auth | 완료 |
| 이후 | LocalStorage cart · 카테고리 필터 · Vitest | 완료 |

---

## 1단계: 핵심 로직 및 로컬 데이터

### 이번에 만든 것

- 하드코딩된 상품 4개를 화면에 보여 준다.
- 「담기」로 장바구니에 넣고, `+` / `-`로 수량을 바꾼다.
- 수량이 1일 때 `-`를 누르면 항목이 사라진다.
- 총액은 **별도 state 없이** `cartItems`와 `products`를 이어서 계산한다.
- 장바구니가 비면 「담긴 상품이 없습니다」를 보여 준다.

파일 기준으로 보면:

| 파일 | 역할 |
|------|------|
| `src/App.tsx` | `cartItems` 상태 + 담기/증감 로직 + 총액 계산 |
| `src/components/ProductList.tsx` | 상품 목록 UI |
| `src/components/Cart.tsx` | 장바구니 UI |
| `src/types.ts` | `Product`, `CartItem` 타입 |
| `src/data/products.ts` | mock 상품 데이터 |

---

### 핵심 개념

#### 1) 상태(state) vs 파생 값(derived value)

**개념**  
화면에 보이는 모든 숫자를 `useState`로 둘 필요는 없다.  
“원본 데이터”만 state로 두고, 그걸로 **계산해서 나오는 값**은 매 렌더마다 구하면 된다.

**이 프로젝트에서**  
- state: `cartItems` (무엇을 몇 개 담았는지)
- 파생 값: `totalPrice` (가격 × 수량의 합)

```ts
const totalPrice = cartItems.reduce((sum, item) => {
  const product = products.find((p) => p.id === item.productId)
  return sum + (product?.price ?? 0) * item.quantity
}, 0)
```

총액을 state로 따로 두면, 담기/삭제할 때마다 **두 군데를 같이 맞춰야** 해서 버그가 나기 쉽다.  
원본(`cartItems`)만 바꾸면 총액은 자동으로 맞는다.

---

#### 2) 데이터 정규화 (중복 저장하지 않기)

**개념**  
같은 정보를 여러 곳에 복사해 두면, 한쪽만 바뀌었을 때 데이터가 어긋난다.

**이 프로젝트에서**  
- `Product`: 이름, 가격, 이미지 (마스터 데이터)
- `CartItem`: `productId` + `quantity`만

```ts
type CartItem = {
  productId: string
  quantity: number
}
```

장바구니에 `name`, `price`를 넣지 않는다.  
표시할 때는 `products.find(p => p.id === item.productId)`로 조인한다.

---

#### 3) 불변 업데이트 (immutable update)

**개념**  
React는 “이전 배열을 직접 수정했는지”보다 **새 참조가 생겼는지**로 리렌더를 판단하는 경우가 많다.  
그래서 `push`, `quantity++`처럼 **원본을 직접 바꾸는 방식** 대신, `map` / `filter` / 스프레드로 **새 배열**을 만든다.

**이 프로젝트에서**

- 담기 (이미 있으면 수량 +1):

```ts
return prev.map((item) =>
  item.productId === productId
    ? { ...item, quantity: item.quantity + 1 }
    : item,
)
```

- 수량 1에서 `-` → 삭제:

```ts
return prev.filter((item) => item.productId !== productId)
```

---

#### 4) Props로 상태 내려주기 (전역 상태 없이)

**개념**  
상태가 필요한 곳의 **가장 가까운 공통 부모**에 state를 두고, 자식에게 Props로 넘긴다.  
1단계에서는 Context나 Zustand를 쓰지 않는다. “먼저 Props로 흐름을 이해”하는 단계다.

**이 프로젝트에서**

```
App (cartItems)
 ├─ ProductList (products, onAddToCart)
 └─ Cart (cartItems, products, totalPrice, onIncrease, onDecrease)
```

자식은 `setCartItems`를 직접 만지지 않고, `App`이 만든 핸들러만 호출한다.

---

#### 5) 컴포넌트 분리

**개념**  
한 파일에 UI와 로직을 다 넣어도 동작은 하지만, **역할이 섞이면** 수정할 때 어디를 고쳐야 할지 찾기 어렵다.

**이 프로젝트에서**  
- `ProductList`: “목록을 보여 주고, 담기 버튼을 누르게 한다”
- `Cart`: “장바구니를 보여 주고, ±를 누르게 한다”
- `App`: “진짜로 상태를 바꾸고, 총액을 계산한다”

UI는 자식, **규칙(비즈니스 로직)은 부모**에 두는 패턴이다.

---

#### 6) TypeScript 타입으로 역할을 나누기

**개념**  
타입이 있으면 “장바구니에 가격을 넣어도 되나?” 같은 실수를 컴파일 단계에서 줄일 수 있다.

**이 프로젝트에서**  
- `Product` = 상품 마스터  
- `CartItem` = 장바구니 한 줄  

필드가 다르다는 것 자체가 **설계 문서** 역할을 한다. (자세한 스키마는 [TDD](./TDD.md))

---

#### 7) 문서(PRD / SRD / TRD / TDD)는 왜 쓰나?

코드를 쓰기 전에 “무엇을 / 어떤 규칙으로 / 어떤 기술로 / 어떤 데이터로”를 나눠 적으면, 구현이 흔들리지 않는다.

| 문서 | 한 줄 요약 |
|------|------------|
| PRD | 제품이 **무엇을** 해야 하는가 (목표·비목표·사용자 스토리) |
| SRD | **기능·비기능** 요구를 ID로 쪼개 검증 가능하게 |
| TRD | **어떻게** 구현할까 (스택, 폴더, Props, 알고리즘) |
| TDD | **데이터가** 어떻게 생겼는가 (타입, 조인, 총액 식) |

---

### 코드로 익힌 패턴

| 패턴 | 언제 쓰나 | 1단계 예시 |
|------|-----------|------------|
| `useState` | 시간이 지나며 바뀌는 원본 데이터 | `cartItems` |
| `reduce` | 배열 → 하나의 합계 | `totalPrice` |
| `find` | id로 한 건 찾기 | 상품 조인 |
| `map` | 일부만 바꾼 새 배열 | 수량 +1 |
| `filter` | 조건에 맞는 것만 남김 | 항목 삭제 |
| Props 콜백 | 자식 이벤트를 부모 로직에 연결 | `onAddToCart` |

담기 로직의 전체 흐름:

1. 같은 `productId`가 있는지 본다.
2. 있으면 `map`으로 수량만 +1.
3. 없으면 `[...prev, { productId, quantity: 1 }]`로 추가.

---

### 자주 하는 실수 vs 올바른 방향

| 자주 하는 실수 | 올바른 방향 |
|----------------|-------------|
| `totalPrice`도 `useState`로 관리 | `cartItems`만 state, 총액은 매번 계산 |
| 장바구니에 `name`, `price` 복사 | `productId`만 두고 `products`에서 조회 |
| `cartItems.push(...)` / `item.quantity++` | `map` / `filter` / 스프레드로 새 배열 |
| 모든 UI와 로직을 `App.tsx` 한 파일에 | 목록 / 장바구니 컴포넌트로 분리 |
| 처음부터 Context·전역 상태 도입 | 1단계는 Props로 흐름을 먼저 익힌다 |

---

### 스스로 점검 체크리스트

- [ ] `cartItems` 외에 총액용 state를 만들지 않았는가?
- [ ] `CartItem`에 상품 이름·가격이 없는가?
- [ ] 담기 시 “이미 있으면 수량만 +1”이 되는가?
- [ ] 수량 1에서 `-`를 누르면 항목이 삭제되는가?
- [ ] 빈 장바구니에 「담긴 상품이 없습니다」가 보이는가?
- [ ] `ProductList` / `Cart`가 Props만으로 동작하는가? (직접 `useState`로 장바구니를 갖지 않는가?)
- [ ] 가격이 바뀌면(마스터만 수정) 장바구니 총액도 따라가는 구조인가? (정규화의 이점)

---

### 한 줄 회고

> **원본 상태만 깔끔히 두고, 나머지는 계산하고 조인한다** — 이게 1단계에서 가장 중요한 성장 포인트다.

---

## 2단계: FakeStore API 연동 및 예외 처리

### 이번에 만든 것

- FakeStore API로 상품을 가져온다. (`Product`: `title`, `image`, `id: number` 등)
- 로딩 중 「상품을 불러오는 중입니다...」를 보여 준다.
- **API 실패 시** 「오류 발생」 배너와 함께 **로컬 `mockProducts`로 폴백**한다 (빈 화면으로 끝내지 않음).
- API 성공 시에는 FakeStore만 표시하고 mock과 **병합하지 않는다**.
- 장바구니 담기·±·총액 파생 로직은 1단계와 동일하게 유지한다.

---

### 핵심 개념

#### 1) `useEffect`로 마운트 시 데이터 가져오기

**개념**  
컴포넌트가 처음 화면에 올라온 직후(마운트) 한 번 API를 호출하려면 `useEffect`에 빈 의존성 배열 `[]`을 쓴다.

**이 프로젝트에서**

```ts
useEffect(() => {
  let cancelled = false
  async function loadProducts() { /* fetch ... */ }
  loadProducts()
  return () => { cancelled = true }
}, [])
```

cleanup의 `cancelled`는 “이미 화면을 떠났는데 늦게 도착한 응답으로 state를 바꾸지 않기” 위한 안전장치다.

---

#### 2) 비동기 UI + 폴백

**개념**  
로딩 / 오류 / 성공을 나누되, 오류일 때 **아무것도 못 하게** 막기보다, 가능한 범위에서 **대체 데이터(폴백)** 를 주는 편이 UX가 낫다.

| 상태 | 이 프로젝트 |
|------|-------------|
| Loading | 「상품을 불러오는 중입니다...」 |
| Success | FakeStore 목록 (`error === null`) |
| Error + Fallback | 「오류 발생」 배너 + `mockProducts` 목록 |

```ts
} catch {
  setProducts(mockProducts)
  setError('오류 발생')
}
```

렌더는 `error`만 있으면 목록을 숨기지 않고, 배너와 목록을 **같이** 보여 준다.

---

#### 3) API 스키마에 타입을 맞추기

**개념**  
내 마음대로 `name`이라고 부르면, 응답의 `title`과 어긋나 런타임에 `undefined`가 된다.  
**서버가 주는 이름**에 타입을 맞추는 편이 안전하다.

| 1단계 (mock) | 2단계 (FakeStore) |
|--------------|-------------------|
| `id: string` | `id: number` |
| `name` | `title` |
| `imageUrl` | `image` |
| (없음) | `description` |

`CartItem.productId`도 `number`로 따라간다.  
총액 계산은 여전히 `price`만 쓰고, 화면 표시만 `title` / `image`로 바꾼다.

---

#### 4) `products`는 state — 출처만 바뀐다

**개념**  
`products`는 API든 mock이든 **같은 state 슬롯**에 들어간다. 장바구니·총액 코드는 “어디서 왔는지”를 몰라도 된다.

- 성공 → FakeStore 배열
- 실패 → `mockProducts` (id는 9001~로 FakeStore와 충돌 방지)

정규화 원칙은 그대로다. 장바구니에 `title`을 복사하지 않는다.

---

### 코드로 익힌 패턴

| 패턴 | 역할 |
|------|------|
| `fetch` + `res.ok` 검사 | HTTP 실패를 catch와 구분 |
| `try / catch / finally` | 성공·실패 후 로딩 플래그 정리 |
| 폴백 대체 | catch에서 `setProducts(mockProducts)` |
| 배너 + 목록 | 오류여도 UI를 막지 않음 |
| 스키마 통일 | mock도 FakeStore와 같은 `Product` 타입 |

---

### 자주 하는 실수 vs 올바른 방향

| 자주 하는 실수 | 올바른 방향 |
|----------------|-------------|
| 로딩 UI 없이 빈 목록만 보여 줌 | `isLoading`일 때 안내 문구 |
| 오류 시 목록을 아예 안 보여 줌 | 배너 + mock 폴백으로 시뮬 유지 |
| API·mock 스키마를 다르게 둠 | 동일 `Product` 타입 |
| 성공 시에도 mock을 목록에 섞음 | 성공=API만, 실패=mock만 (대체) |
| 총액을 API 전용 state로 저장 | `cartItems`×`products` 파생 |

---

### 스스로 점검 체크리스트

- [ ] 마운트 시 FakeStore를 한 번 호출하는가?
- [ ] 로딩 UI가 있는가?
- [ ] 실패 시 「오류 발생」과 함께 `mockProducts`가 보이는가?
- [ ] 성공 시 mock이 목록에 섞이지 않는가?
- [ ] `Product.id`와 `CartItem.productId`가 모두 `number`인가?
- [ ] 폴백 상태에서도 담기·±·총액이 동작하는가?

---

### 한 줄 회고

> **API를 우선하고, 실패해도 mock 폴백으로 흐름을 끊지 않는다** — 타입은 API와 mock이 같아야 폴백이 쉽다.

---

## 3단계: Redux Toolkit 전역 장바구니 + Firebase Auth

### 이번에 만든 것

- 장바구니를 `App`의 `useState`에서 **Redux Toolkit `cartSlice`** 로 옮긴다.
- `ProductList` / `Cart`가 `useDispatch` · `useSelector`로 같은 store를 공유한다.
- **Firebase Google 로그인**으로 초기 인증 확인·로그인·실패 안내·로그아웃을 구현한다.
- 인증 상태를 Redux `authSlice`로 옮기고, `AuthListener`가 `onAuthStateChanged`로 세션을 추적한다.
- 인증과 cart는 별도 slice이지만, **로그아웃 시 `clearCart`로 장바구니를 비운다** (게스트 최초 로드는 예외).
- 로그인 전에도 상품·장바구니를 쓸 수 있다.
- 총액은 여전히 **파생 값**이다 (Redux에 total state를 두지 않음).

파일 기준으로 보면:

| 파일 | 역할 |
|------|------|
| `src/store/slices/cartSlice.ts` | cart items + actions + 파생 selectors |
| `src/store/slices/authSlice.ts` | auth user·status·error |
| `src/store/index.ts` | `configureStore`, typed hooks |
| `src/services/firebase.ts` | Firebase 앱·Auth 초기화 + login/logout helper |
| `src/components/AuthListener.tsx` | `App` 하위 `onAuthStateChanged` 구독 → authSlice + clearCart |
| `src/components/AuthBar.tsx` | 로그인 / 로그아웃 UI |
| `src/main.tsx` | `<Provider store={store}>` |

---

### 핵심 개념

#### 1) Props drilling에서 전역 store로

**개념**  
공통 부모가 cart를 들고 Props로 내리면, 중간 컴포넌트가 많아질수록 전달이 번거롭다.  
전역 store는 “어디서든 같은 cart를 읽고 바꿀 수 있게” 한다.

**이 프로젝트에서**  
- 1·2단계: `App` → Props → `ProductList` / `Cart`
- 3단계: `cartSlice` → `useSelector` / `useDispatch`

총액·정규화 규칙은 그대로다. **소유 위치만** 바뀐다.

---

#### 2) slice · action · selector

**개념**  
- **slice**: 한 도메인(state + reducers)  
- **action**: “무엇을 바꿀지” 요청  
- **selector**: store에서 필요한 조각만 읽기  

```ts
dispatch(addToCart(productId))
const items = useSelector((state: RootState) => state.cart.items)
```

Immer 덕분에 reducer 안에서 “직접 수정하는 것처럼” 써도, 실제로는 불변 업데이트가 된다.

---

#### 3) Firebase Auth listener를 Redux로

**개념**  
로그인 버튼을 눌렀을 때만 user를 아는 게 아니다.  
앱이 켜진 뒤 `onAuthStateChanged`가 **현재 세션**을 알려 준다.  
이 리스너를 컴포넌트마다 두면 중복 구독이 되므로, **`AuthListener`를 `App` 안에서 한 번만** 마운트하고 결과를 `authSlice`에 넣는다.  
`App`은 `auth.status === 'loading'`이면 전체 스피너만 보여 로그인 버튼을 오표시하지 않는다.

| `status` | UI |
|------|-----|
| `loading` | 인증 확인 중 (로그인 버튼 오표시 방지) |
| `authenticated` | 이름/이메일 + 로그아웃 |
| `unauthenticated` | Google 로그인 버튼 |
| `error` | 실패 안내 |

auth와 cart는 별도 slice다. **출처가 다른 상태**를 한 slice에 억지로 합치지 않는다.

---

#### 4) 로그아웃 시 cart 비우기 (상태 전이 감지)

**개념**  
"로그아웃하면 장바구니를 비운다"를 안전하게 트리거하려면, `signOut` 버튼 클릭이 아니라 **리스너의 상태 전이**를 기준으로 삼는 게 낫다. 세션 만료·다른 탭 로그아웃도 같은 콜백으로 들어오기 때문이다.

**이 프로젝트에서**  
`AuthListener`가 직전 uid를 `useRef`로 기억하고, `user`가 `null`이 될 때 **직전에 uid가 있었을 때만** `clearCart`를 dispatch한다.

```ts
const prevUidRef = useRef<string | null>(null)
// onAuthStateChanged 콜백:
if (!user && prevUidRef.current) dispatch(clearCart())
prevUidRef.current = user?.uid ?? null
```

첫 로드의 비로그인(`null`)에서는 clear하지 않아 **게스트 장바구니가 보존**된다.

---

#### 5) 환경 변수와 비밀정보

**개념**  
Firebase Web 설정(`apiKey` 등)은 클라이언트에 노출될 수 있지만,  
**service account · Admin private key · 비밀번호**는 절대 프론트·Git에 넣지 않는다.

`.env.example`에는 변수 **이름과 자리표시자**만 두고, 실제 값은 로컬 `.env`에만 둔다.

---

### 코드로 익힌 패턴

| 패턴 | 역할 |
|------|------|
| `configureStore` + `Provider` | 앱 전체에 store 연결 |
| `createSlice` | cart reducer·actions 한곳에 |
| `useSelector` / `useDispatch` | 읽기 / 쓰기 |
| `onAuthStateChanged` + cleanup | `AuthListener` 단일 인증 구독·해제 |
| `useRef` 상태 전이 감지 | 로그아웃 시 `clearCart` 트리거 |
| `signInWithPopup` / `signOut` | Google 로그인·로그아웃 |

---

### 자주 하는 실수 vs 올바른 방향

| 자주 하는 실수 | 올바른 방향 |
|----------------|-------------|
| `App`에 cart `useState`를 남겨 둠 | Redux만 사용, 로컬 cart 제거 |
| total을 Redux state로 저장 | items만 저장, 총액은 파생 |
| auth user를 cart slice에 복사 | `authSlice`·`cartSlice` 분리, 리스너 단일 출처 |
| Firebase `User` 원본을 store에 저장 | 직렬화 가능한 `AuthUser`만 저장 |
| Provider 없이 `useSelector` | `main.tsx`에서 Provider 래핑 |
| 실제 `.env` 값을 README·캡처에 노출 | 자리표시자만 공개 |

---

### 스스로 점검 체크리스트

- [ ] `@reduxjs/toolkit` · `react-redux` · `firebase`가 설치되어 있는가?
- [ ] `Provider`로 앱이 감싸져 있는가?
- [ ] 담기·±·총액이 Redux cart로 동작하는가?
- [ ] Google 로그인·초기 상태·실패 안내·로그아웃이 되는가?
- [ ] 로그인 전에도 상품·장바구니를 쓸 수 있는가?
- [ ] API 폴백(2단계)이 그대로 동작하는가?
- [ ] `.env.example`만 커밋하고 실제 비밀값은 없는가?

---

### 한 줄 회고

> **cart는 Redux, auth는 Firebase — 출처가 다른 상태는 합치지 않는다.** 총액은 여전히 파생 값이다.
