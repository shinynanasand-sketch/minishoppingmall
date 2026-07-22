import type { Product } from '../types'

/** API 실패·오프라인 시 폴백용 로컬 상품 (FakeStore Product 스키마와 동일) */
export const mockProducts: Product[] = [
  {
    id: 9001,
    title: '무선 이어폰 (로컬)',
    price: 89000,
    description: '네트워크 오류 시 표시되는 로컬 폴백 상품입니다.',
    image: 'https://picsum.photos/seed/earbuds/200/200',
    category: 'electronics',
  },
  {
    id: 9002,
    title: '노트북 스탠드 (로컬)',
    price: 35000,
    description: '네트워크 오류 시 표시되는 로컬 폴백 상품입니다.',
    image: 'https://picsum.photos/seed/stand/200/200',
    category: 'electronics',
  },
  {
    id: 9003,
    title: '기계식 키보드 (로컬)',
    price: 129000,
    description: '네트워크 오류 시 표시되는 로컬 폴백 상품입니다.',
    image: 'https://picsum.photos/seed/keyboard/200/200',
    category: 'electronics',
  },
  {
    id: 9004,
    title: 'USB-C 허브 (로컬)',
    price: 45000,
    description: '네트워크 오류 시 표시되는 로컬 폴백 상품입니다.',
    image: 'https://picsum.photos/seed/hub/200/200',
    category: 'electronics',
  },
]
