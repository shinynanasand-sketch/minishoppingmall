import { addToCart } from '../store/slices/cartSlice'
import { useAppDispatch } from '../store'
import type { Product } from '../types'
import { ProductImage } from './ProductImage'

type ProductListProps = {
  products: Product[]
  searchTerm: string
  onSearchTermChange: (value: string) => void
  selectedCategory: string
  categories: string[]
  onCategoryChange: (value: string) => void
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

export function ProductList({
  products,
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  categories,
  onCategoryChange,
}: ProductListProps) {
  const dispatch = useAppDispatch()
  const isFiltering =
    searchTerm.trim().length > 0 || selectedCategory !== 'all'

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">상품 목록</h2>
          <p className="mt-1 text-sm text-stone-500">
            상품명 검색과 카테고리로 목록을 좁힐 수 있습니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-stone-600">
            상품 검색
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="예: backpack"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-stone-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-stone-600 sm:w-48">
            카테고리
            <select
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-700"
            >
              <option value="all">전체</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {products.length === 0 ? (
        <p className="py-16 text-center text-stone-500">
          {isFiltering ? '검색 결과가 없습니다' : '표시할 상품이 없습니다'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white"
            >
              <ProductImage
                src={product.image}
                alt={product.title}
                className="h-40 w-full object-contain bg-white p-4"
              />
              <div className="flex flex-1 flex-col gap-2 p-4">
                {product.category ? (
                  <p className="text-xs uppercase tracking-wide text-stone-500">
                    {product.category}
                  </p>
                ) : null}
                <h3 className="line-clamp-2 font-medium text-stone-900">
                  {product.title}
                </h3>
                <p className="text-stone-600">{formatPrice(product.price)}</p>
                <button
                  type="button"
                  onClick={() => dispatch(addToCart(product.id))}
                  className="mt-auto rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700"
                >
                  담기
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
