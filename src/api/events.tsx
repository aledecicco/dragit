import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { match, P } from 'ts-pattern'

import { useSelectedRefs } from '@/context/branches'

import type { AppEvent } from './models'
import {
  branchDivergenceQueryKeys,
  branchesQueryKeys,
  commitHistoryQueryKeys,
  commonAncestorQueryKeys,
  headInfoQueryKeys,
  pathQueryKey,
  remotesQueryKeys,
  stashesQueryKeys,
  worktreeFilesQueryKeys,
} from './queries'
import { fileConflictsQueryKeys } from './queries/fileConflicts'
import { fileDiffQueryKeys } from './queries/fileDiff'

const EVENT_ID = 'app-event'

/**
 * Subscribes the app to events coming from the backend, and invalidates queries accordingly.
 */
const useEventsHandler = () => {
  const client = useQueryClient()
  const { reference } = useSelectedRefs()

  useEffect(() => {
    const unlisten = listen<AppEvent>(EVENT_ID, (event) => {
      console.log(`Received event: ${JSON.stringify(event)}`)
      match(event.payload)
        .with({ type: 'dirDisappeared', repoPath: P._ }, () => {
          // TODO: show a notification that the directory is gone
        })
        .with({ type: 'dirChanged' }, () => {
          client.resetQueries()
        })
        .with(
          { type: 'gitFolderModified', repoPath: P.string },
          ({ repoPath }) => {
            client.invalidateQueries({
              queryKey: [pathQueryKey(repoPath)],
            })
          },
        )
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
              queryKey: [
                commitHistoryQueryKeys.reference(repoPath, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                branchDivergenceQueryKeys.branch(repoPath, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                branchDivergenceQueryKeys.baseBranch(repoPath, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                commonAncestorQueryKeys.reference(repoPath, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                commonAncestorQueryKeys.baseReference(repoPath, branchName),
              ],
            })

            if (
              reference &&
              reference.type === 'branch' &&
              reference.refName === branchName
            ) {
              client.invalidateQueries({
                queryKey: [headInfoQueryKeys.all(repoPath)],
              })
              client.invalidateQueries({
                queryKey: [worktreeFilesQueryKeys.all(repoPath)],
              })
            }
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
        .with(
          { type: 'stashesUpdated', repoPath: P.string },
          ({ repoPath }) => {
            client.invalidateQueries({
              queryKey: [stashesQueryKeys.all(repoPath)],
            })
          },
        )
        .exhaustive()
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client.resetQueries, client.invalidateQueries, reference])
}

export { useEventsHandler }
