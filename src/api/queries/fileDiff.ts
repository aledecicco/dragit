import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'
import { P, match } from 'ts-pattern'

import { pathQueryKey } from '.'
import type { DiffSection, DiffType, FileDiff } from '../models'
import { FILE_DIFF_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'

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
  context: QueryFunctionContext,
  reference: string,
  filepath: string,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    { path, reference, filepath },
    FILE_DIFF_SCHEMA,
    context,
  )

  const sections: DiffSection[] = res.sections.map((section) => {
    const diffType = match(section.diffType)
      .returnType<DiffType>()
      .with({ Added: P._ }, () => 'added')
      .with({ Removed: P._ }, () => 'removed')
      .with({ Unchanged: P._ }, () => 'unchanged')
      .exhaustive()

    return {
      diffType,
      lines: section.lines,
    }
  })

  return { sections }
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
        ? (context) => fetchFileDiff(path, context, reference, filepath)
        : skipToken,
  })

const useQueryFileDiff = (
  reference: string | undefined,
  filediff: string | undefined,
) => useRepositoryQuery(fileDiffQuery, reference, filediff)

export { filesDiffQueryKeys, useQueryFileDiff }
