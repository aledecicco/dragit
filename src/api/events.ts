import {
  type Event,
  emit,
  listen,
  type UnlistenFn,
} from '@tauri-apps/api/event'
import { useEffectOnce } from 'react-use'
import { match, P } from 'ts-pattern'

import { dirDisappearedToast } from '@/common/Toasts/DirDisappeared'
import { fileWatcherMissedToast } from '@/common/Toasts/FileWatcherMissed'
import { toast } from '@/lib/Toasts/Toast'

import { client } from './client'
import type { AppEvent } from './models'
import { branchDivergenceQueryKeys } from './queries/branchDivergence'
import { branchesQueryKeys } from './queries/branches'
import { commitHistoryQueryKeys } from './queries/commitHistory'
import { commonAncestorQueryKeys } from './queries/commonAncestor'
import { currentDirQueryKey } from './queries/currentDir'
import { fileConflictsQueryKeys } from './queries/fileConflicts'
import { fileDiffQueryKeys } from './queries/fileDiff'
import { headInfoQueryKeys } from './queries/headInfo'
import { remotesQueryKeys } from './queries/remotes'
import { stashesQueryKeys } from './queries/stashes'
import { storageQueryKey } from './queries/storage'
import { tagsQueryKeys } from './queries/tags'
import { worktreeFilesQueryKeys } from './queries/worktreeFiles'
import { pathQueryKey } from './utils'

const EVENT_ID = 'app-event'

const eventHandler = (event: Event<AppEvent>) => {
  match(event.payload)
    .with({ type: 'frontendReady' }, () => {
      // ignore, can't happen
    })
    .with({ type: 'storageUpdated' }, () => {
      client.invalidateQueries({
        queryKey: [storageQueryKey],
      })
    })
    .with({ type: 'dirChanged' }, () => {
      client.resetQueries()
    })
    .with({ type: 'dirDisappeared', repoPath: P.select() }, (repoPath) => {
      toast(dirDisappearedToast(repoPath))
    })
    .with({ type: 'fileWatcherMissed' }, () => {
      toast(fileWatcherMissedToast())
    })
    .with({ type: 'gitFolderModified', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [currentDirQueryKey],
      })

      client.invalidateQueries({
        queryKey: [pathQueryKey(repoPath)],
      })
    })
    .with(
      { type: 'branchesListUpdated', repoPath: P.string },
      ({ repoPath }) => {
        client.invalidateQueries({
          queryKey: [branchesQueryKeys.all(repoPath)],
        })
      },
    )
    .with(
      { type: 'branchUpdated', repoPath: P.string, name: P.string },
      ({ name: branchName, repoPath }) => {
        client.invalidateQueries({
          queryKey: [commitHistoryQueryKeys.reference(repoPath, branchName)],
        })

        client.invalidateQueries({
          queryKey: [branchDivergenceQueryKeys.branch(repoPath, branchName)],
        })

        client.invalidateQueries({
          queryKey: [
            branchDivergenceQueryKeys.baseBranch(repoPath, branchName),
          ],
        })

        client.invalidateQueries({
          queryKey: [commonAncestorQueryKeys.reference(repoPath, branchName)],
        })

        client.invalidateQueries({
          queryKey: [
            commonAncestorQueryKeys.baseReference(repoPath, branchName),
          ],
        })

        client.invalidateQueries({
          queryKey: [headInfoQueryKeys.all(repoPath)],
        })

        client.invalidateQueries({
          queryKey: [worktreeFilesQueryKeys.all(repoPath)],
        })
      },
    )
    .with({ type: 'headChanged', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [headInfoQueryKeys.all(repoPath)],
      })
    })
    .with({ type: 'filesModified', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [
          worktreeFilesQueryKeys.status(repoPath, ['unstaged', 'untracked'])
            .all,
        ],
      })

      client.invalidateQueries({
        queryKey: [fileConflictsQueryKeys.all(repoPath)],
      })
    })
    .with({ type: 'configUpdated', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [currentDirQueryKey],
      })

      client.invalidateQueries({
        queryKey: [branchesQueryKeys.all(repoPath)],
      })

      client.invalidateQueries({
        queryKey: [remotesQueryKeys.all(repoPath)],
      })
    })
    .with({ type: 'indexUpdated', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [worktreeFilesQueryKeys.all(repoPath)],
      })

      client.invalidateQueries({
        queryKey: [fileDiffQueryKeys.all(repoPath)],
      })
    })
    .with({ type: 'stashesUpdated', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [stashesQueryKeys.all(repoPath)],
      })
    })
    .with({ type: 'tagsUpdated', repoPath: P.string }, ({ repoPath }) => {
      client.invalidateQueries({
        queryKey: [tagsQueryKeys.all(repoPath)],
      })
    })
    .exhaustive()
}

let isReady = false

/**
 * Subscribes the app to events coming from the backend, and invalidates queries accordingly.
 */
const useBackendEventshandler = () => {
  useEffectOnce(() => {
    let unlisten: Promise<UnlistenFn>

    async function setupListener() {
      unlisten = listen<AppEvent>(EVENT_ID, eventHandler)
      await unlisten

      if (!isReady) {
        isReady = true
        emit(EVENT_ID, {
          type: 'frontendReady',
        })
      }
    }

    setupListener()

    return () => {
      unlisten.then((fn) => fn())
    }
  })
}

export { useBackendEventshandler }
