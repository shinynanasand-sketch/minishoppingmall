# SRD — 소프트웨어 요구사항 명세서

| 항목 | 내용 |
|------|------|
| 문서명 | Software Requirements Document |
| 관련 문서 | [PRD.md](./PRD.md), [TRD.md](./TRD.md), [TDD.md](./TDD.md) |
| 단계 | 3단계: Redux Toolkit 전역 장바구니 + Firebase Auth |
| 버전 | 3.4 |

---

## 1. 개요

1·2단계 장바구니·API·mock 폴백을 유지한 채, **Firebase Google 인증(FR-08)** 과 **Redux Toolkit 전역 장바구니(FR-09)** 를 정의한다.

---

## 2. 기능 요구사항

### FR-01 상품 목록 표시 (API 성공)

| 항목 | 내용 |
|------|------|
| 설명 | FakeStore 응답을 화면에 렌더링한다 |
| 입력 | API `Product` |
| 출력 | 상품 카드(이미지, 제목, 가격, 「담기」) |
| 우선순위 | 필수 |

### FR-02 장바구니 담기 / FR-03 수량 / FR-04 총액 / FR-05 빈 상태

1단계와 동일. `productId`는 `number`, 표시명은 `title`. 3단계부터 상태는 Redux `cartSlice`가 소유한다 (FR-09).

### FR-06 로딩 상태

| 항목 | 내용 |
|------|------|
| 문구 | `상품을 불러오는 중입니다...` |
| 우선순위 | 필수 |

### FR-07 오류 상태 + mock 폴백

| 항목 | 내용 |
|------|------|
| 설명 | fetch 실패 또는 `!res.ok` 시 오류를 알리고 로컬 mock으로 목록을 채운다 |
| 오류 문구 | `오류 발생` |
| 부가 안내 | 로컬 상품으로 표시한다는 설명 |
| 데이터 | `src/data/products.ts`의 `mockProducts` |
| 제약 | API 성공 시 mock과 **병합하지 않음** (대체만) |
| 우선순위 | 필수 |

### FR-08 Firebase 구글 로그인/로그아웃/인증 상태 유지

| 항목 | 내용 |
|------|------|
| 설명 | Google 로그인, 인증 초기 상태 확인, 로그인/비로그인 구분, 실패 안내, 로그아웃을 제공한다 |
| 입력 | Google 팝업 결과, `AuthListener`의 `onAuthStateChanged` |
| 출력 | 사용자 표시(displayName 또는 마스킹된 email), 「Google로 로그인」 / 「로그아웃」 버튼, 오류 문구 |
| 상태 | Redux `authSlice` (`user`, `status`, `error`)에 저장. Firebase `User` 원본은 저장하지 않는다 |
| 초기 상태 | `status = 'loading'` 동안 로그인 화면을 오표시하지 않는다 |
| 로그아웃 | 로그아웃·세션 종료 시 `clearCart`로 장바구니를 비운다 (게스트 최초 로드는 예외) |
| 제약 | 로그인 방식은 Google 1개만. 환경 변수(`VITE_FIREBASE_*`)만 사용하고 값을 하드코딩하지 않는다. service account·Admin private key·비밀번호를 코드·레포에 두지 않는다 |
| 우선순위 | 필수 |

### FR-09 Redux 장바구니 슬라이스 및 전역 상태 공유

| 항목 | 내용 |
|------|------|
| 설명 | `cartSlice`로 담기·수량 ±·제거를 관리하고, `ProductList`와 `Cart`가 동일 Redux store를 selector로 공유한다 |
| 입력 | `productId`, add / increase / decrease actions |
| 출력 | 전역 `cartItems`, selector(또는 컴포넌트 파생)로 계산한 총액 |
| 제약 | 총액을 별도 Redux state로 두지 않는다. `App`의 `useState` cart를 제거한다. 정규화 `CartItem`(`productId`, `quantity`)를 유지한다 |
| 우선순위 | 필수 |

---

## 3. 비기능 요구사항

| ID | 분류 | 요구사항 |
|----|------|----------|
| NFR-01 | 기술 스택 | React, TypeScript, Tailwind CSS |
| NFR-02 | 상태 관리 | Redux Toolkit + React Redux (`cartSlice`, Provider) |
| NFR-03 | 데이터 소스 | 우선 FakeStore `fetch`, 실패 시 `mockProducts` |
| NFR-04 | 타입 | API·mock 모두 동일 `Product` 스키마 |
| NFR-05 | 복원력 | 오프라인·네트워크 오류에도 시뮬레이터 사용 가능 |
| NFR-06 | 인증 | Firebase Authentication (Google), 환경 변수로 Web 설정만 사용 |
| NFR-07 | 상태 소유 | cart → Redux `cartSlice`, auth → Redux `authSlice`(단일 `AuthListener`가 갱신), products/loading/error → App |

---

## 4. UI / UX 요구사항

| ID | 요구사항 |
|----|----------|
| UI-01~06 | 2컬럼/스택, 담기, ±, 총액, 빈 장바구니 (기존) |
| UI-07 | 로딩: 「상품을 불러오는 중입니다...」 |
| UI-08 | 오류 배너: 「오류 발생」+ 폴백 안내, **그 아래 상품 목록·장바구니 유지** |
| UI-09 | 인증 영역: 초기 확인 / 로그인 / 사용자 표시 / 로그아웃 / 실패 안내 |
| UI-10 | 로그인 전에도 상품 열람·장바구니 사용 가능 |
| UI-11 | `auth.status === 'loading'`일 때 App 전체 스피너 (AuthBar·상품·장바구니 숨김) |
| UI-12 | 상품 목록이 비면 「표시할 상품이 없습니다」 |
| UI-13 | 상품 이미지 로드 실패 시 「이미지 없음」 대체 UI |
| UI-14 | API 실패 배너에 「다시 시도」로 재요청 가능 |
| UI-15 | 상품명 검색어로 상품 목록을 필터링하고 결과가 없으면 「검색 결과가 없습니다」 |

---

## 5. 컴포넌트 경계

| 컴포넌트 | 책임 |
|----------|------|
| `App` | `AuthListener` 마운트, auth 로딩 게이트, fetch/폴백, `isLoading`/`error`/`products` (cart state 미소유) |
| `store` / `cartSlice` / `authSlice` | 전역 cart·auth state·actions |
| `ProductList` / `Cart` | 표시·`dispatch` / `useSelector` |
| `AuthBar` | 로그인·로그아웃·인증 상태 표시 |
| `AuthListener` | `App` 하위 1회 구독 → `authSlice` 갱신 + 조건부 `clearCart` |
| `services/firebase` | Firebase 앱·Auth 인스턴스·login/logout helper |

---

## 6. 검증 시나리오

1. 정상: 로딩 → FakeStore 목록 (오류 배너 없음).
2. 실패(오프라인 등): 「오류 발생」배너 + mock 상품 목록.
3. 폴백 상태에서도 담기·±·총액·빈 상태 동작.
4. 인증: 초기 확인 → Google 로그인 → 사용자 표시 → 로그아웃 → 비로그인 UI.
5. 전역 cart: 상품 담기 후 장바구니·총액이 동일 Redux 상태를 반영.
6. 로그인 실패 시 오류 안내가 보이고, cart·상품 목록은 유지된다.
7. 로그아웃 시 장바구니가 비워진다.
8. 비로그인 상태로 새로고침해도 게스트 장바구니는 유지된다.
9. 상품명 검색 시 일치하는 상품만 보이고, 0건이면 검색 결과 안내가 보인다.
