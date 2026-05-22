import axios, { type AxiosError } from 'axios'
import { env } from '@/utils/env'
import { normalizeError } from './client'

/** Client sans JWT — endpoints publics (signup). */
export const publicApiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

publicApiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => Promise.reject(normalizeError(error)),
)
