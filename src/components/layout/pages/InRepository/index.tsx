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

import { showSettingsDialog } from '@/common/SettingsDialog'
import { useApplySomeStashInteraction } from '@/interactions/stash'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { DropArea } from '@/lib/DragAndDrop/DropArea'
import { triggerInteraction } from '@/state/actions'
import { useBasesSync } from '@/state/branches'
import {
  changeSelectedFile,
  useFileDiffsSync,
  useSelectedFile,
} from '@/state/file'
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
        <div
          className={cn(
            'flex flex-row items-center gap-2',
            'justify-self-center max-w-half',
          )}
        >
          <DecoratedButton
            label="View settings"
            Glyph={IconSettings}
            onClick={() => {
              showSettingsDialog()
            }}
            status="neutral"
            variant="plain"
            size="lg"
            round
            compact
          />
          <CurrentDirectory />
        </div>

        <DropArea
          className={cn('w-full h-full min-h-0')}
          acceptedTypes={['staged-files', 'not-staged-files']}
          label={{
            'not-staged-files': 'view file diff',
            'staged-files': 'view file diff',
          }}
          extraValidation={(payload) => {
            return payload.dragged.length === 1
          }}
          handleDrop={(payload) => {
            changeSelectedFile(payload.dragged.at(0))
          }}
        >
          {selectedFile ? (
            <SelectedFileDiff selectedFile={selectedFile} />
          ) : (
            <Graph />
          )}
        </DropArea>
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
