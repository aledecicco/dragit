import { useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { type PropsWithChildren, useEffect } from 'react'
import { P, match } from 'ts-pattern'

import { useSelectedBranches } from '@context/branches'
import type { AppEvent } from './models'
import { queryKeys } from './queries'

const EVENT_ID = 'app-event'

const EventHandler = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()

  const { branch: currentBranch } = useSelectedBranches()

  useEffect(() => {
    const unlisten = listen<AppEvent>(EVENT_ID, (event) => {
      match(event.payload)
        .with({ type: 'dirDisappeared' }, () => {
          // TODO: show a notification that the directory is gone
        })
        .with({ type: 'dirChanged' }, () => {
          client.resetQueries()
        })
        .with({ type: 'gitFolderModified', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: queryKeys.directory.current(path),
          })
        })
        .with({ type: 'branchesListUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.branches(path)],
          })
        })
        .with(
          { type: 'branchUpdated', path: P.string, name: P.string },
          ({ name: branchName, path }) => {
            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commitHistory.branch(path, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.branchDivergence.branch(path, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.branchDivergence.baseBranch(
                  path,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.branch(path, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.baseBranch(path, branchName),
              ],
            })

            if (currentBranch && currentBranch.name === branchName) {
              client.invalidateQueries({
                queryKey: [queryKeys.directory.headInfo(path)],
              })
            }
          },
        )
        .with({ type: 'headChanged', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(path)],
          })
        })
        .with({ type: 'filesModified', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.files.unstaged(path)],
          })

          client.invalidateQueries({
            queryKey: [queryKeys.directory.files.untracked(path)],
          })
        })
        .with({ type: 'configUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.branches(path)],
          })

          client.invalidateQueries({
            queryKey: [queryKeys.directory.remotes(path)],
          })
        })
        .with({ type: 'indexUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.files.all(path)],
          })
        })
        .exhaustive()
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client.resetQueries, client.invalidateQueries, currentBranch])

  return children
}

export { EventHandler }
