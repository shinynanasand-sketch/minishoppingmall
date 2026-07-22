import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectCartItems,
  selectTotalPrice,
  selectTotalQuantity,
} from '../store/slices/cartSlice'
import { useAppDispatch, useAppSelector } from '../store'
import type { Product } from '../types'
import { ProductImage } from './ProductImage'

type CartProps = {
  products: Product[]
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

export function Cart({ products }: CartProps) {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector(selectCartItems)
  const totalQuantity = useAppSelector(selectTotalQuantity)
  const totalPrice = useAppSelector((state) => selectTotalPrice(state, products))

  return (
    <section
      id="cart"
      className="scroll-mt-8 rounded-lg border border-stone-200 bg-white p-4"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-stone-900">
          장바구니
          {totalQuantity > 0 && (
            <span className="ml-2 text-sm font-normal text-stone-500">
              ({totalQuantity}개)
            </span>
          )}
        </h2>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="text-sm text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
          >
            비우기
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className="py-8 text-center text-stone-500">담긴 상품이 없습니다</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cartItems.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null

            return (
              <li
                key={item.productId}
                className="flex items-center gap-3 border-b border-stone-100 pb-3 last:border-0"
              >
                <ProductImage
                  src={product.image}
                  alt={product.title}
                  className="h-14 w-14 shrink-0 rounded object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900">
                    {product.title}
                  </p>
                  <p className="text-sm text-stone-600">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(decreaseQuantity(item.productId))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded border border-stone-300 text-stone-700 hover:bg-stone-100"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <span className="w-6 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(increaseQuantity(item.productId))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded border border-stone-300 text-stone-700 hover:bg-stone-100"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(removeFromCart(item.productId))
                    }
                    className="ml-1 text-xs text-stone-500 hover:text-red-700"
                    aria-label="항목 삭제"
                  >
                    삭제
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="font-medium text-stone-700">총액</span>
        <span className="text-lg font-semibold text-stone-900">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </section>
  )
}
