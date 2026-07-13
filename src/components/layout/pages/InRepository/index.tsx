import { IconSettings } from '@tabler/icons-react'

import { BranchesList } from '@/layout/widgets/BranchesList'
import { CurrentDirectory } from '@/layout/widgets/CurrentDirectory'
import { CurrentRemote } from '@/layout/widgets/CurrentRemote'
import { Graph } from '@/layout/widgets/Graph'
import { MainToolbar } from '@/layout/widgets/MainToolbar'
import { RecyclingBin } from '@/layout/widgets/RecyclingBin'
import { SecondaryToolbar } from '@/layout/widgets/SecondaryToolbar'
import { SelectedFileDiff } from '@/layout/widgets/SelectedFileDiff'
import { StashesList } from '@/layout/widgets/StashesList'
import { NotStagedWorktreeChanges } from '@/layout/widgets/WorktreeChanges/NotStaged'
import { StagedWorktreeChanges } from '@/layout/widgets/WorktreeChanges/Staged'

import { showCommandPalette } from '@/common/CommandPalette'
import { useApplySomeStashInteraction } from '@/interactions/stash'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { useBasesSync } from '@/state/branches'
import { useFileDiffsSync, useSelectedFile } from '@/state/file'
import { useSettings } from '@/state/storage'
import { useUpstreamsSync } from '@/state/upstream'
import { useCheckForUpdates } from '@/utils/behavior'
import { cn } from '@/utils/styles'

/**
 * Page that is displayed when a repository is open.
 */
const InRepositoryPage = () => {
  useBasesSync()
  useUpstreamsSync()
  useFileDiffsSync()
  useCheckForUpdates()

  const selectedFile = useSelectedFile()
  const applyStash = useApplySomeStashInteraction()

  const settings = useSettings()
  useShortcutBinding(settings.commandPaletteShortcut, showCommandPalette)

  return (
    <>
      <div
        className={cn(
          'grid grid-rows-[min-content_minmax(0,5fr)_max-content] gap-2',
        )}
      >
        <StashesList className={cn('max-h-45 overflow-hidden')} />

        <DropArea
          acceptedTypes={['stash']}
          label={{
            stash: 'apply stash changes',
          }}
          handleDrop={({ dragged }) => {
            triggerInteraction(applyStash(dragged))
          }}
          className={cn('grid grid-rows-2 gap-4 mb-2 overflow-hidden')}
        >
          <NotStagedWorktreeChanges className={cn('h-full')} />
          <StagedWorktreeChanges className={cn('h-full')} />
        </DropArea>

        <MainToolbar />
      </div>

      <div
        className={cn('grid grid-rows-[max-content_1fr] gap-4 overflow-hidden')}
      >
        <CurrentDirectory className={cn('justify-self-center max-w-half')} />

        {selectedFile ? (
          <SelectedFileDiff
            selectedFile={selectedFile}
            className={cn('size-full min-h-0')}
          />
        ) : (
          <Graph />
        )}
      </div>

      <div
        className={cn(
          'grid grid-rows-[max-content_1fr_max-content] gap-4',
          'relative',
        )}
      >
        <CurrentRemote />
        <BranchesList />
        <SecondaryToolbar />

        <RecyclingBin className={cn('absolute bottom-0 left-0 w-full h-50')} />
      </div>
    </>
  )
}

export { InRepositoryPage }
