import { match } from 'ts-pattern'

import type { DiffScope, FileDiff } from '@/api/models'
import { useQueryFileDiff } from '@/api/queries/fileDiff'
import { FileIcon } from '@/common/File/Icon'
import { FileStatus } from '@/common/File/Status'
import { cn } from '@/utils/styles'

import {
  FileViewerContainer,
  type FileViewerContainerProps,
} from '../common/Container'
import { FileDiffViewerContent } from './Content'
import type { DiffFilter } from './utils'

export const LARGE_DIFF_THRESHOLD = 1000

interface FileDiffViewerProps
  extends Partial<FileViewerContainerProps<FileDiff>> {
  /**
   * The scope of the diff to display (staged changes, unstaged changes, or a specific snapshot).
   */
  diffScope: DiffScope

  /**
   * An optional filter to apply to the displayed diff lines.
   */
  filter?: DiffFilter
}

/**
 * Displays the contents of a file, showing changes made to it on each line.
 */
const FileDiffViewer = (props: FileDiffViewerProps) => {
  const { diffScope, filter = 'both', ...containerProps } = props

  const fileDiffQuery = useQueryFileDiff(diffScope)
  const fileStageAnnotation =
    diffScope.type === 'unmerged'
      ? match(diffScope.stage)
          .with('ours', () => (
            <span className={cn('text-xs text-primary-500')}>Ours</span>
          ))
          .with('theirs', () => (
            <span className={cn('text-xs text-warning-500')}>Theirs</span>
          ))
          .exhaustive()
      : match(filter)
          .with('ours', () => 'After changes')
          .with('theirs', () => 'Before changes')
          .with('both', () =>
            'changes' in diffScope.file &&
            diffScope.file.changes === 'renamed' ? (
              `Moved from ./${diffScope.file.oldPath}`
            ) : (
              <FileStatus file={diffScope.file} />
            ),
          )
          .exhaustive()

  const filepath =
    diffScope.type === 'unmerged'
      ? diffScope.file.path
      : match(filter)
          .with('theirs', () =>
            'changes' in diffScope.file && diffScope.file.changes === 'renamed'
              ? diffScope.file.oldPath
              : diffScope.file.path,
          )
          .otherwise(() => diffScope.file.path)

  return (
    <FileViewerContainer
      {...containerProps}
      query={fileDiffQuery}
      decoration={<FileIcon file={diffScope.file} size="lg" />}
      filepath={filepath}
      annotation={fileStageAnnotation}
    >
      {(fileDiff) => (
        <FileDiffViewerContent
          fileDiff={fileDiff}
          filter={filter}
          filepath={filepath}
        />
      )}
    </FileViewerContainer>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }
