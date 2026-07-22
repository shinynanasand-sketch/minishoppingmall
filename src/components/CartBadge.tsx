import { useAppSelector } from '../store'
import { selectTotalQuantity } from '../store/slices/cartSlice'

/** Header badge: derived total quantity from Redux cart (not stored separately). */
export function CartBadge() {
  const totalQuantity = useAppSelector(selectTotalQuantity)

  return (
    <a
      href="#cart"
      className="relative inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
      aria-label={`장바구니 ${totalQuantity}개`}
    >
      장바구니
      <span
        className={
          totalQuantity > 0
            ? 'inline-flex min-w-6 items-center justify-center rounded-full bg-stone-900 px-1.5 py-0.5 text-xs font-semibold text-white'
            : 'inline-flex min-w-6 items-center justify-center rounded-full bg-stone-200 px-1.5 py-0.5 text-xs font-semibold text-stone-600'
        }
      >
        {totalQuantity}
      </span>
    </a>
  )
}
