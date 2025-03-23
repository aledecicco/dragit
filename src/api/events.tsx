import { useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { type PropsWithChildren, useEffect } from 'react'
import { P, match } from 'ts-pattern'

import { useSelectedBranches } from '@context/branches'
import { queryKeys } from './queries'
import { useCurrentPath, useHasCurrentPath } from './utils'

const EVENT_ID = 'app-event'

const EventHandler = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()
  const hasCurrentPath = useHasCurrentPath()

  useEffect(() => {
    const unlisten = listen(EVENT_ID, (event) => {
      match(event.payload).with({ type: 'dirChanged' }, () => {
        client.resetQueries()
      })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client.resetQueries])

  return hasCurrentPath ? (
    <EventHandlerInner>{children}</EventHandlerInner>
  ) : (
    children
  )
}

const EventHandlerInner = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()
  const { branch: currentBranch } = useSelectedBranches()
  const currentPath = useCurrentPath()

  useEffect(() => {
    const unlisten = listen(EVENT_ID, (event) => {
      match(event.payload)
        .with({ type: 'gitFolderModified' }, () => {
          client.invalidateQueries({
            queryKey: queryKeys.directory.current(currentPath),
          })
        })
        .with({ type: 'branchesListUpdated' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.branches.list(currentPath)],
          })
        })
        .with(
          { type: 'branchUpdated', name: P.string.select() },
          (branchName) => {
            console.log(branchName)

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commitHistory.branch(
                  currentPath,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.branchDivergence.branch(
                  currentPath,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.branchDivergence.baseBranch(
                  currentPath,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.branch(
                  currentPath,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.baseBranch(
                  currentPath,
                  branchName,
                ),
              ],
            })

            if (currentBranch && currentBranch.name === branchName) {
              client.invalidateQueries({
                queryKey: [queryKeys.directory.headInfo(currentPath)],
              })
            }
          },
        )
        .with({ type: 'headChanged' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(currentPath)],
          })
        })
        .with({ type: 'filesModified' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(currentPath)],
          })
        })
        .with({ type: 'configUpdated' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.branches.list(currentPath)],
          })
        })
        .with({ type: 'indexUpdated' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(currentPath)],
          })
        })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client, currentPath, currentBranch])

  return children
}

export { EventHandler }
