import { match, P } from 'ts-pattern'

import { NOT_STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/NotStaged'
import { STAGED_FILE_TYPES } from '@/layout/widgets/WorktreeChanges/Staged'

import type {
  NotStagedFile,
  RefName,
  StagedFile,
  VersionedFileInfo,
  WorktreeFileInfo,
} from '@/api/models'
import {
  useStageAll,
  useStageFile,
  useStageFiles,
} from '@/api/mutations/addToIndex'
import {
  useUnstageAll,
  useUnstageFile,
  useUnstageFiles,
} from '@/api/mutations/removeFromIndex'
import {
  useDiscardChanges,
  useDiscardFileChanges,
  useRestoreFileState,
  useRestoreFileStates,
} from '@/api/mutations/restore'
import { useStashFile, useStashFiles } from '@/api/mutations/saveStash'
import {
  useAcceptAsIs,
  useAcceptDeletion,
  useAcceptFile,
  useAcceptManyAsIs,
  useAcceptManyDeletions,
  useAcceptManyFiles,
  useAcceptManyOurs,
  useAcceptManyTheirs,
  useAcceptOurs,
  useAcceptTheirs,
  useIgnoreDeletion,
  useIgnoreFile,
  useIgnoreManyDeletions,
  useIgnoreManyFiles,
} from '@/api/mutations/solveFileConflicts'
import { requestWorktreeFiles } from '@/common/FileSelectorDialog'
import { requestStashParams } from '@/common/StashDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import type { AnyInteraction } from '@/state/actions'
import { getSettings } from '@/state/storage'
import { pluralize } from '@/utils/string'

import { useStashFilesInteraction } from './stash'

export const useStageFileInteraction = (file: WorktreeFileInfo) => {
  const stage = useStageFile(file)

  return interaction({ action: stage, details: `stage "${file.path}"` })
}

export const useStashFileInteraction = (file: WorktreeFileInfo) => {
  const stash = useStashFile(file)

  return interaction({
    action: stash,
    argsRequester: async () => {
      const { askForStashMessage } = getSettings()
      const message = askForStashMessage
        ? (await requestStashParams()).message
        : null
      return { message }
    },
    details: `stash "${file.path}"`,
  })
}

export const useDiscardFileInteraction = (file: WorktreeFileInfo) => {
  const discard = useDiscardFileChanges(file)

  return interaction({
    action: discard,
    isDangerous: true,
    details: `discard changes in "${file.path}"`,
  })
}

export const useUnstageFileInteraction = (file: WorktreeFileInfo) => {
  const unstage = useUnstageFile(file)

  return interaction({ action: unstage, details: `unstage "${file.path}"` })
}

export const useAcceptAsIsInteraction = (file: WorktreeFileInfo) => {
  const acceptAsIs = useAcceptAsIs(file)

  return interaction({
    action: acceptAsIs,
    details: `accept current state of "${file.path}"`,
  })
}

export const useAcceptOursInteraction = (file: WorktreeFileInfo) => {
  const acceptOurs = useAcceptOurs(file)

  return interaction({
    action: acceptOurs,
    details: `accept our changes for "${file.path}"`,
  })
}

export const useAcceptTheirsInteraction = (file: WorktreeFileInfo) => {
  const acceptTheirs = useAcceptTheirs(file)

  return interaction({
    action: acceptTheirs,
    details: `accept their changes for "${file.path}"`,
  })
}

export const useAcceptDeletionInteraction = (file: WorktreeFileInfo) => {
  const acceptDeletion = useAcceptDeletion(file)

  return interaction({
    action: acceptDeletion,
    details: `accept deletion of "${file.path}"`,
  })
}

export const useIgnoreDeletionInteraction = (file: WorktreeFileInfo) => {
  const ignoreDeletion = useIgnoreDeletion(file)

  return interaction({ action: ignoreDeletion, details: `keep "${file.path}"` })
}

export const useAcceptNewFileInteraction = (file: WorktreeFileInfo) => {
  const acceptNewFile = useAcceptFile(file)

  return interaction({
    action: acceptNewFile,
    details: `accept new file "${file.path}"`,
  })
}

export const useIgnoreNewFileInteraction = (file: WorktreeFileInfo) => {
  const ignoreNewFile = useIgnoreFile(file)

  return interaction({
    action: ignoreNewFile,
    details: `ignore new file "${file.path}"`,
  })
}

export const useRestoreFileInteraction = (
  file: VersionedFileInfo,
  snapshot: RefName,
) => {
  const restore = useRestoreFileState(file, snapshot)

  return interaction({
    action: restore,
    details: `restore contents of "${file.path}"`,
  })
}

export const useSingleNotStagedFileInteractions = (file: NotStagedFile) => {
  const stage = useStageFileInteraction(file)
  const stash = useStashFileInteraction(file)
  const discard = useDiscardFileInteraction(file)

  const acceptAsIs = useAcceptAsIsInteraction(file)
  const acceptOurs = useAcceptOursInteraction(file)
  const acceptTheirs = useAcceptTheirsInteraction(file)
  const acceptDeletion = useAcceptDeletionInteraction(file)
  const ignoreDeletion = useIgnoreDeletionInteraction(file)
  const acceptNewFile = useAcceptNewFileInteraction(file)
  const ignoreNewFile = useIgnoreNewFileInteraction(file)

  if (file.status === 'unmerged') {
    return match(file.changes)
      .with(P.union('bothAdded', 'bothModified'), () => [
        group(acceptAsIs, acceptOurs, acceptTheirs),
      ])
      .with(P.union('addedByUs', 'addedByThem'), () => [
        group(acceptNewFile, ignoreNewFile),
      ])
      .with('bothDeleted', () => [group(acceptDeletion)])
      .with(P.union('deletedByUs', 'deletedByThem'), () => [
        group(acceptDeletion, ignoreDeletion),
      ])
      .exhaustive()
  }

  return [group(stage, stash), group(discard)]
}

export const useSingleStagedFileInteractions = (file: StagedFile) => {
  const unstage = useUnstageFileInteraction(file)
  const discard = useDiscardFileInteraction(file)

  return [group(unstage), group(discard)]
}

export const useSingleVersionedFileInteractions = (
  file: VersionedFileInfo,
  snapshot: RefName,
) => {
  const restore = useRestoreFileInteraction(file, snapshot)

  return [group(restore)]
}

export const useUnstageFilesInteraction = () => {
  const unstage = useUnstageFiles()

  return (files: StagedFile[]) =>
    interaction({
      action: unstage,
      argsRequester: () => files,
      details: `unstage ${pluralize('file', files.length, true)}`,
    })
}

export const useUnstageAllInteraction = () => {
  const unstageAll = useUnstageAll()

  return interaction({ action: unstageAll, details: 'unstage all changes' })
}

export const useDiscardFilesInteraction = () => {
  const discard = useDiscardChanges()

  return (files: WorktreeFileInfo[]) =>
    interaction({
      action: discard,
      argsRequester: () => files,
      isDangerous: true,
      details: `discard changes in ${pluralize('file', files.length, true)}`,
    })
}

export const useStageFilesInteraction = () => {
  const stage = useStageFiles()

  return (files: NotStagedFile[]) =>
    interaction({
      action: stage,
      argsRequester: () => files,
      details: `stage ${pluralize('file', files.length, true)}`,
    })
}

export const useStageAllInteraction = () => {
  const stageAll = useStageAll()
  return interaction({ action: stageAll, details: 'stage all changes' })
}

export const useAcceptManyAsIsInteraction = () => {
  const acceptAsIs = useAcceptManyAsIs()

  return (files: NotStagedFile[]) =>
    interaction({
      action: acceptAsIs,
      argsRequester: () => files,
      details: `accept current state of ${pluralize('file', files.length, true)}`,
    })
}

export const useAcceptManyOursInteraction = () => {
  const acceptOurs = useAcceptManyOurs()

  return (files: NotStagedFile[]) =>
    interaction({
      action: acceptOurs,
      argsRequester: () => files,
      details: `accept our changes for ${pluralize('file', files.length, true)}`,
    })
}

export const useAcceptManyTheirsInteraction = () => {
  const acceptTheirs = useAcceptManyTheirs()

  return (files: NotStagedFile[]) =>
    interaction({
      action: acceptTheirs,
      argsRequester: () => files,
      details: `accept their changes for ${pluralize('file', files.length, true)}`,
    })
}

export const useAcceptManyDeletionsInteraction = () => {
  const acceptDeletions = useAcceptManyDeletions()

  return (files: NotStagedFile[]) =>
    interaction({
      action: acceptDeletions,
      argsRequester: () => files,
      details: `accept deletion of ${pluralize('file', files.length, true)}`,
    })
}

export const useIgnoreManyDeletionsInteraction = () => {
  const ignoreDeletions = useIgnoreManyDeletions()

  return (files: NotStagedFile[]) =>
    interaction({
      action: ignoreDeletions,
      argsRequester: () => files,
      details: `keep ${pluralize('file', files.length, true)}`,
    })
}

export const useAcceptManyNewFilesInteraction = () => {
  const acceptNewFiles = useAcceptManyFiles()

  return (files: NotStagedFile[]) =>
    interaction({
      action: acceptNewFiles,
      argsRequester: () => files,
      details: `accept ${pluralize('new file', files.length, true)}`,
    })
}

export const useIgnoreManyNewFilesInteraction = () => {
  const ignoreNewFiles = useIgnoreManyFiles()

  return (files: NotStagedFile[]) =>
    interaction({
      action: ignoreNewFiles,
      argsRequester: () => files,
      details: `ignore ${pluralize('new file', files.length, true)}`,
    })
}

export const useGetNotStagedFilesInteractions = () => {
  const stageInteraction = useStageFilesInteraction()
  const stashInteraction = useStashFilesInteraction()
  const acceptAsIsInteraction = useAcceptManyAsIsInteraction()
  const acceptOursInteraction = useAcceptManyOursInteraction()
  const acceptTheirsInteraction = useAcceptManyTheirsInteraction()
  const acceptDeletionsInteraction = useAcceptManyDeletionsInteraction()
  const ignoreDeletionsInteraction = useIgnoreManyDeletionsInteraction()
  const acceptNewFilesInteraction = useAcceptManyNewFilesInteraction()
  const ignoreNewFilesInteraction = useIgnoreManyNewFilesInteraction()
  const discardInteraction = useDiscardFilesInteraction()

  return (files: NotStagedFile[]): AnyInteraction[][] => {
    const allBothAddedOrModified = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'bothAdded' || file.changes === 'bothModified'),
    )
    if (allBothAddedOrModified) {
      return [
        group(
          acceptAsIsInteraction(files),
          acceptOursInteraction(files),
          acceptTheirsInteraction(files),
        ),
      ]
    }

    const allAddedByUsOrThem = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'addedByUs' || file.changes === 'addedByThem'),
    )
    if (allAddedByUsOrThem) {
      return [
        group(
          acceptNewFilesInteraction(files),
          ignoreNewFilesInteraction(files),
        ),
      ]
    }

    const allDeletedByUsOrThem = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'deletedByUs' || file.changes === 'deletedByThem'),
    )
    if (allDeletedByUsOrThem) {
      return [
        group(
          acceptDeletionsInteraction(files),
          ignoreDeletionsInteraction(files),
        ),
      ]
    }

    const allDeleted = files.every(
      (file) =>
        file.status === 'unmerged' &&
        (file.changes === 'bothDeleted' ||
          file.changes === 'deletedByUs' ||
          file.changes === 'deletedByThem'),
    )
    if (allDeleted) {
      return [group(acceptDeletionsInteraction(files))]
    }

    const anyUnmerged = files.some((file) => file.status === 'unmerged')
    if (anyUnmerged) {
      return [group(stageInteraction(files))]
    }

    return [
      group(stageInteraction(files), stashInteraction(files)),
      group(discardInteraction(files)),
    ]
  }
}

export const useGetStagedFilesInteractions = () => {
  const unstageInteraction = useUnstageFilesInteraction()
  const discardInteraction = useDiscardFilesInteraction()

  return (files: StagedFile[]): AnyInteraction[][] => [
    group(unstageInteraction(files)),
    group(discardInteraction(files)),
  ]
}

export const useRestoreFileStatesInteraction = (snapshot: RefName) => {
  const restore = useRestoreFileStates(snapshot)

  return (files: VersionedFileInfo[]) =>
    interaction({
      action: restore,
      argsRequester: () => files,
      details: `restore contents of ${pluralize('file', files.length, true)}`,
    })
}

export const useGetVersionedFilesInteractions = (snapshot: RefName) => {
  const restore = useRestoreFileStatesInteraction(snapshot)

  return (files: VersionedFileInfo[]): AnyInteraction[][] => [
    group(restore(files)),
  ]
}

export const useSelectAndStageFilesInteraction = () => {
  const stage = useStageFiles()

  return interaction({
    action: stage,
    argsRequester: () => requestWorktreeFiles(NOT_STAGED_FILE_TYPES),
    details: 'stage files',
  })
}

export const useSelectAndUnstageFilesInteraction = () => {
  const unstage = useUnstageFiles()

  return interaction({
    action: unstage,
    argsRequester: () => requestWorktreeFiles(STAGED_FILE_TYPES),
    details: 'unstage files',
  })
}

export const useSelectAndStashFilesInteraction = () => {
  const stash = useStashFiles()

  return interaction({
    action: stash,
    argsRequester: async () => {
      const files = await requestWorktreeFiles(NOT_STAGED_FILE_TYPES)
      const { askForStashMessage } = getSettings()
      const message = askForStashMessage
        ? (await requestStashParams()).message
        : null
      return { files, message }
    },
    details: 'stash files',
  })
}
