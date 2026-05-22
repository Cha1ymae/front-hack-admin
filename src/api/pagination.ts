import type { Page } from '@/types/api'

export async function collectCursorPages<T>(
  fetchPage: (cursor?: string) => Promise<Page<T>>,
  options: { maxItems?: number; maxPages?: number } = {},
): Promise<T[]> {
  const maxItems = options.maxItems ?? 1000
  const maxPages = options.maxPages ?? 20
  const items: T[] = []
  let cursor: string | undefined
  let pages = 0

  do {
    const page = await fetchPage(cursor)
    items.push(...page.items)
    cursor = page.nextCursor
    pages += 1
  } while (cursor && items.length < maxItems && pages < maxPages)

  return items
}
