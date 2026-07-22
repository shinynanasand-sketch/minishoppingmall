import { useEffect } from 'react'
import { addToCart } from '../store/slices/cartSlice'
import { useAppDispatch } from '../store'
import type { Product } from '../types'
import { ProductImage } from './ProductImage'

type ProductDetailProps = {
  product: Product
  onClose: () => void
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-3">
          <h2
            id="product-detail-title"
            className="text-lg font-semibold text-stone-900"
          >
            상품 상세
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            aria-label="상세 닫기"
          >
            닫기
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          <ProductImage
            src={product.image}
            alt={product.title}
            className="mx-auto h-40 w-40 shrink-0 object-contain sm:mx-0"
          />
          <div className="min-w-0 flex-1 space-y-2">
            {product.category ? (
              <p className="text-xs uppercase tracking-wide text-stone-500">
                {product.category}
              </p>
            ) : null}
            <h3 className="font-medium text-stone-900">{product.title}</h3>
            <p className="text-lg font-semibold text-stone-900">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm leading-relaxed text-stone-600">
              {product.description || '설명이 없습니다.'}
            </p>
            <button
              type="button"
              onClick={() => {
                dispatch(addToCart(product.id))
                onClose()
              }}
              className="mt-2 w-full rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 sm:w-auto"
            >
              담기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
