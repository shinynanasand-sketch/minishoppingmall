# 화면 캡처

| 파일 | 장면 |
|------|------|
| `01-products.png` | 상품 목록 (검색·카테고리 포함) |
| `02-cart.png` | 전체 화면 (장바구니 영역 포함) |
| `03-auth.png` | 인증 영역 (Google 로그인 버튼 / 설정 안내) |
| `04-error-fallback.png` | 오류·mock 폴백 + 「다시 시도」 |

재촬영:

```bash
npm run dev
# 다른 터미널에서
npm run capture
```

로그인 **성공** 화면(이름·아바타)은 Google 계정으로 직접 로그인한 뒤 `03-auth.png`를 다시 찍으면 됩니다.  
캡처에 실제 이메일·UID 전체가 보이면 마스킹하세요.
