import { ApiNotAvailableError } from './errors'
import type { Page } from '@/types/api'
import type { Document } from '@/types/entities'

const MESSAGE =
  'Le service Documents n’est pas exposé par le backend (aucun endpoint /documents).'

export async function listDocuments(): Promise<Page<Document>> {
  throw new ApiNotAvailableError(MESSAGE)
}

export async function deleteDocument(_id: string): Promise<void> {
  throw new ApiNotAvailableError(MESSAGE)
}
