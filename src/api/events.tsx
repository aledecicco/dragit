import { useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { type PropsWithChildren, useEffect } from 'react'
import { P, match } from 'ts-pattern'

import { useSelectedRefs } from '@context/branches'
import type { AppEvent } from './models'
import { queryKeys } from './queries'

const EVENT_ID = 'app-event'

const EventHandler = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()

  const { reference } = useSelectedRefs()

  useEffect(() => {
    const unlisten = listen<AppEvent>(EVENT_ID, (event) => {
      console.log(`Received event: ${JSON.stringify(event)}`)
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
                queryKeys.directory.commitHistory.reference(path, branchName),
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
                queryKeys.directory.commonAncestor.reference(path, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.baseReference(
                  path,
                  branchName,
                ),
              ],
            })

            if (
              reference &&
              reference.type === 'branch' &&
              reference.refName === branchName
            ) {
              client.invalidateQueries({
                queryKey: [queryKeys.directory.headInfo(path)],
              })
              client.invalidateQueries({
                queryKey: [queryKeys.directory.files.all(path)],
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
            queryKey: [queryKeys.directory.files.status(path, 'unstaged').all],
          })

          client.invalidateQueries({
            queryKey: [queryKeys.directory.files.status(path, 'untracked').all],
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
        .with({ type: 'stashesUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.stashes(path)],
          })
        })
        .exhaustive()
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client.resetQueries, client.invalidateQueries, reference])

  return children
}

export { EventHandler }
