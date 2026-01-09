import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'

import { MS_IN_SECOND } from '@/utils/time'

import type { TagInfo } from '../models'
import { TAGS_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

const tagsQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'tags',
    }) as const,
}

const fetchTags = async (
  repoPath: string,
  context: QueryFunctionContext,
): Promise<TagInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_tags',
    { repoPath },
    TAGS_SCHEMA,
    context,
  )

  return res.map((resItem) => ({
    ...resItem,
    type: 'tag',
    timestamp: resItem.timestamp * MS_IN_SECOND,
  }))
}

const tagsQuery = (repoPath: string) =>
  queryOptions({
    queryKey: [tagsQueryKeys.all(repoPath)],
    queryFn: (context) => fetchTags(repoPath, context),
  })

const useQueryTags = () => useRepositoryQuery(tagsQuery)

export { tagsQueryKeys, useQueryTags }
