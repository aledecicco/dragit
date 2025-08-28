import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'

import type { FileDiff } from '../models'
import { FILE_DIFF_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

export const FILE_DIFF_PAGE_SIZE = 1000

const filesDiffQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'file_diff',
    }) as const,
  reference: (path: string, reference: string | undefined) =>
    ({
      ...filesDiffQueryKeys.all(path),
      reference: reference,
    }) as const,
  file: (
    path: string,
    reference: string | undefined,
    filepath: string | undefined,
  ) =>
    ({
      ...filesDiffQueryKeys.reference(path, reference),
      filepath: filepath,
    }) as const,
}

const fetchFileDiff = async (
  path: string,
  reference: string,
  filepath: string,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      path,
      reference,
      filepath,
    },
    FILE_DIFF_SCHEMA,
    context,
  )

  return res
}

const fileDiffQuery = (
  path: string,
  reference: string | undefined,
  filepath: string | undefined,
) =>
  queryOptions({
    queryKey: [filesDiffQueryKeys.file(path, reference, filepath)],
    queryFn:
      !!reference && !!filepath
        ? (context) => fetchFileDiff(path, reference, filepath, context)
        : skipToken,
  })

const useQueryFileDiff = (
  reference: string | undefined,
  filediff: string | undefined,
) => useRepositoryQuery(fileDiffQuery, reference, filediff)

export { filesDiffQueryKeys, useQueryFileDiff }
