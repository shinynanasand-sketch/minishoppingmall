import { useState } from 'react'

type ProductImageProps = {
  src: string
  alt: string
  className?: string
}

/** Shows a muted placeholder when the product image fails to load. */
export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (이미지 없음)`}
        className={`flex items-center justify-center bg-stone-100 text-sm text-stone-400 ${className ?? ''}`}
      >
        이미지 없음
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
