import { match } from 'ts-pattern'

import type { DiffScope } from '@/api/models'
import { useQueryHighlightedDiff } from '@/api/queries/highlightedDiff'
import { FileIcon } from '@/common/File/Icon'
import { FileStatus } from '@/common/File/Status'
import type { DiffFilter } from '@/highlighting/utils'
import { useSettings } from '@/state/storage'
import { Chip } from '@/ui/Chip'

import { FileViewerBody } from '../common/Body'
import {
  FileViewerContainer,
  type FileViewerContainerProps,
} from '../common/Container'
import { FileViewerGate, useFileDiffGate } from '../common/Gate'

interface FileDiffViewerProps extends Partial<FileViewerContainerProps> {
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

  const fileStageAnnotation =
    diffScope.type === 'unmerged'
      ? match(diffScope.stage)
          .with('ours', () => (
            <Chip size="xs" rounded={false} status="primary">
              Ours
            </Chip>
          ))
          .with('theirs', () => (
            <Chip size="xs" rounded={false} status="warning">
              Theirs
            </Chip>
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

  const { showWordDiffs } = useSettings()

  const gate = useFileDiffGate(diffScope)

  const highlightedQuery = useQueryHighlightedDiff(
    diffScope,
    filepath,
    filter,
    showWordDiffs,
    gate.status === 'allowed',
  )

  return (
    <FileViewerContainer
      {...containerProps}
      content={highlightedQuery.data}
      decoration={<FileIcon file={diffScope.file} size="lg" />}
      filepath={filepath}
      annotation={fileStageAnnotation}
    >
      <FileViewerGate gate={gate}>
        <FileViewerBody query={highlightedQuery} />
      </FileViewerGate>
    </FileViewerContainer>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }
