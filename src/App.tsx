import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthBar } from './components/AuthBar'
import { AuthListener } from './components/AuthListener'
import { Cart } from './components/Cart'
import { CartBadge } from './components/CartBadge'
import { ProductList } from './components/ProductList'
import { mockProducts } from './data/products'
import { useAppSelector } from './store'
import { selectAuthStatus } from './store/slices/authSlice'
import type { Product } from './types'

const PRODUCTS_URL = 'https://fakestoreapi.com/products'

function App() {
  const authStatus = useAppSelector(selectAuthStatus)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const categories = useMemo(() => {
    const values = new Set<string>()
    for (const product of products) {
      if (product.category) values.add(product.category)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch =
        !normalizedSearchTerm ||
        product.title.toLowerCase().includes(normalizedSearchTerm)
      return matchesCategory && matchesSearch
    })
  }, [products, searchTerm, selectedCategory])

  const retryLoad = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(PRODUCTS_URL)
        if (!res.ok) {
          throw new Error('Failed to fetch products')
        }
        const data: Product[] = await res.json()
        if (!cancelled) {
          setProducts(data)
          setSelectedCategory('all')
        }
      } catch {
        if (!cancelled) {
          setProducts(mockProducts)
          setError('오류 발생')
          setSelectedCategory('all')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return (
    <>
      <AuthListener />
      {authStatus === 'loading' ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800"
            aria-hidden
          />
          <p className="text-stone-600">인증 상태를 확인하는 중...</p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                미니 이커머스 장바구니
              </h1>
              <p className="mt-1 text-stone-600">
                Google로 로그인하고, 전역 장바구니에 상품을 담아 보세요.
              </p>
            </div>
            <CartBadge />
          </header>

          <div className="mb-6">
            <AuthBar />
          </div>

          {isLoading ? (
            <p className="py-16 text-center text-stone-500">
              상품을 불러오는 중입니다...
            </p>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"
                >
                  <p className="font-medium">{error}</p>
                  <p className="mt-1 text-sm">
                    네트워크 문제로 API 상품을 불러오지 못해 로컬 상품으로
                    표시합니다.
                  </p>
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="mt-3 rounded-md border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-950 hover:bg-amber-100"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <ProductList
                  products={filteredProducts}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  categories={categories}
                  onCategoryChange={setSelectedCategory}
                />
                <aside className="lg:sticky lg:top-8 lg:self-start">
                  <Cart products={products} />
                </aside>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default App
