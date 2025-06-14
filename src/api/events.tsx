import { type PropsWithChildren, useEffect } from 'react'
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
  filesQueryKeys,
  headInfoQueryKeys,
  pathQueryKey,
  remotesQueryKeys,
  stashesQueryKeys,
} from './queries'

const EVENT_ID = 'app-event'

/**
 * Subscribes the app to events coming from the backend, and invalidates queries accordingly.
 */
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
            queryKey: [pathQueryKey(path)],
          })
        })
        .with({ type: 'branchesListUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [branchesQueryKeys.all(path)],
          })
        })
        .with(
          { type: 'branchUpdated', path: P.string, name: P.string },
          ({ name: branchName, path }) => {
            client.invalidateQueries({
              queryKey: [commitHistoryQueryKeys.reference(path, branchName)],
            })

            client.invalidateQueries({
              queryKey: [branchDivergenceQueryKeys.branch(path, branchName)],
            })

            client.invalidateQueries({
              queryKey: [
                branchDivergenceQueryKeys.baseBranch(path, branchName),
              ],
            })

            client.invalidateQueries({
              queryKey: [commonAncestorQueryKeys.reference(path, branchName)],
            })

            client.invalidateQueries({
              queryKey: [
                commonAncestorQueryKeys.baseReference(path, branchName),
              ],
            })

            if (
              reference &&
              reference.type === 'branch' &&
              reference.refName === branchName
            ) {
              client.invalidateQueries({
                queryKey: [headInfoQueryKeys.all(path)],
              })
              client.invalidateQueries({
                queryKey: [filesQueryKeys.all(path)],
              })
            }
          },
        )
        .with({ type: 'headChanged', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [headInfoQueryKeys.all(path)],
          })
        })
        .with({ type: 'filesModified', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [filesQueryKeys.status(path, 'unstaged').all],
          })

          client.invalidateQueries({
            queryKey: [filesQueryKeys.status(path, 'untracked').all],
          })
        })
        .with({ type: 'configUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [branchesQueryKeys.all(path)],
          })

          client.invalidateQueries({
            queryKey: [remotesQueryKeys.all(path)],
          })
        })
        .with({ type: 'indexUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [filesQueryKeys.all(path)],
          })
        })
        .with({ type: 'stashesUpdated', path: P.string }, ({ path }) => {
          client.invalidateQueries({
            queryKey: [stashesQueryKeys.all(path)],
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
