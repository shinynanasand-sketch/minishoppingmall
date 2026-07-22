export type Product = {
  id: number
  title: string
  price: number
  description: string
  image: string
  category?: string
}

export type CartItem = {
  productId: number
  quantity: number
}

export type AuthUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}
