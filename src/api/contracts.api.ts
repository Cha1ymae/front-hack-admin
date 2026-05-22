import { ApiNotAvailableError } from './errors'
import type { Page } from '@/types/api'
import type { Contract } from '@/types/entities'

const MESSAGE =
  'Le service Contrats n’est pas exposé par le backend (aucun endpoint /contracts).'

export async function listContracts(
  _params: { limit?: number; cursor?: string } = {},
): Promise<Page<Contract>> {
  throw new ApiNotAvailableError(MESSAGE)
}
