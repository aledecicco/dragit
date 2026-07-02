import { queryOptions, useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

const hasAiApiKeyQueryKey = { key: 'has_ai_api_key' } as const

const fetchHasAiApiKey = (): Promise<boolean> => {
  return invoke('has_ai_api_key')
}

const hasAiApiKeyQuery = queryOptions({
  queryKey: [hasAiApiKeyQueryKey],
  queryFn: fetchHasAiApiKey,
})

const useQueryHasAiApiKey = () => useQuery(hasAiApiKeyQuery)

export { hasAiApiKeyQuery, hasAiApiKeyQueryKey, useQueryHasAiApiKey }
