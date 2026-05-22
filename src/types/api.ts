export type Page<T> = {
  items: T[]
  nextCursor?: string
}

export type PageQuery = {
  cursor?: string
  limit?: number
}

export type ApiError = {
  message: string
  status?: number
  code?: string
}
