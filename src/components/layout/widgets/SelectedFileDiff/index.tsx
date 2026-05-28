import { type ComponentProps, useRef } from 'react'
import { IconX } from '@tabler/icons-react'

import type { WorktreeFileInfo } from '@/api/models'
import { FileConflictViewer } from '@/common/FileViewer/Conflict'
import {
  UnmergedViewSelector,
  useViewModeSelector,
} from '@/common/FileViewer/Conflict/UnmergedViewSelector'
import { FileDiffViewer } from '@/common/FileViewer/Diff'
import {
  DiffFilterSelector,
  useDiffFilterSelector,
} from '@/common/FileViewer/Diff/FilterSelector'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { changeSelectedFile } from '@/state/file'
import { useSettings } from '@/state/storage'
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
  const filterSelector = useDiffFilterSelector()

  const ref = useRef<HTMLDivElement>(null)
  const settings = useSettings()
  useShortcutBinding(settings.focusMainShortcut, () => {
    ref.current?.focus()
  })
  useShortcutBinding(settings.closeFileDiffShortcut, () => {
    changeSelectedFile(undefined)
  })

  return (
    <div {...propsWithCn(divProps, 'w-full h-full relative bg-dark-800/80')}>
      {selectedFile.status === 'unmerged' ? (
        viewModeSelector.value === 'inline' ? (
          <FileConflictViewer viewerRef={ref} file={selectedFile} />
        ) : (
          <FileDiffViewer
            viewerRef={ref}
            filter="both"
            diffScope={{
              type: 'unmerged',
              stage: viewModeSelector.value ?? 'ours',
              file: selectedFile,
            }}
          />
        )
      ) : (
        <FileDiffViewer
          viewerRef={ref}
          filter={filterSelector.value}
          diffScope={{ type: 'worktree', file: selectedFile }}
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
