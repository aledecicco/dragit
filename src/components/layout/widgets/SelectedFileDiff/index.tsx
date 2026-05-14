import type { ComponentProps } from 'react'
import { IconX } from '@tabler/icons-react'

import type { WorktreeFileInfo } from '@/api/models'
import { FileConflictViewer } from '@/common/FileViewer/Conflict'
import { FileDiffViewer } from '@/common/FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '@/common/FileViewer/Diff/FilterSelector'
import {
  UnmergedViewSelector,
  useViewModeSelector,
} from '@/common/FileViewer/Diff/UnmergedViewSelector'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { changeSelectedFile } from '@/state/file'
import { cn, propsWithCn } from '@/utils/styles'

interface SelectedFileDiffProps extends ComponentProps<'div'> {
  /**
   * The file for which to display the diff.
   */
  selectedFile: WorktreeFileInfo
}

const SelectedFileDiff = (props: SelectedFileDiffProps) => {
  const { selectedFile, ...divProps } = props

  const viewModeSelector = useViewModeSelector()
  const isSideBySide =
    viewModeSelector.value === 'side_by_side' &&
    selectedFile.status === 'unmerged'
  const filterSelector = useDiffFilterSelector()

  return (
    <div {...propsWithCn(divProps, 'w-full h-full relative bg-dark-800/80')}>
      {selectedFile.status === 'unmerged' && !isSideBySide ? (
        <FileConflictViewer file={selectedFile} />
      ) : (
        <FileDiffViewer
          filter={
            selectedFile.status === 'unmerged' ? 'both' : filterSelector.value
          }
          diffScope={
            selectedFile.status === 'unmerged'
              ? {
                  type: 'unmerged',
                  stage: 'ours',
                  file: selectedFile,
                }
              : { type: 'worktree', file: selectedFile }
          }
        />
      )}

      {isSideBySide && (
        <FileDiffViewer
          filter="both"
          className={cn('border-l border-dark-700')}
          diffScope={{
            type: 'unmerged',
            stage: 'theirs',
            file: selectedFile,
          }}
        />
      )}

      {selectedFile.status === 'unmerged' ? (
        <UnmergedViewSelector
          className={cn('absolute bottom-0 left-half -translate-x-half')}
          store={viewModeSelector.store}
        />
      ) : (
        <DiffFilterSelector
          className={cn('absolute bottom-0 left-half -translate-x-half')}
          store={filterSelector.store}
        />
      )}

      <DecoratedButton
        label="Close file diff"
        Glyph={IconX}
        className={cn('text-lg text-light-950', 'absolute top-1.5 right-1.5')}
        onClick={() => {
          changeSelectedFile(undefined)
        }}
        status="neutral"
        variant="plain"
        size="md"
        compact
        round
      />
    </div>
  )
}

export { SelectedFileDiff, type SelectedFileDiffProps }
