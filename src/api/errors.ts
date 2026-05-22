export class ApiNotAvailableError extends Error {
  readonly code = 'ENDPOINT_NOT_AVAILABLE'

  constructor(message: string) {
    super(message)
    this.name = 'ApiNotAvailableError'
  }
}

export function isApiNotAvailable(error: unknown): boolean {
  return error instanceof ApiNotAvailableError
}

export function isForbiddenOrUnauthorized(error: unknown): boolean {
  const status = (error as Error & { status?: number }).status
  return status === 401 || status === 403
}
