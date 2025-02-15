import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { type PropsWithChildren, useEffect } from 'react'
import { P, match } from 'ts-pattern'

import { getCurrentBranchName } from '@utils/repository'
import { currentDirQuery, headInfoQuery, queryKeys } from './queries'

const EventHandler = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()
  const currentDir = useQuery(currentDirQuery)

  useEffect(() => {
    const unlisten = listen('dir-changed', () => {
      client.invalidateQueries()
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client])

  return currentDir.data ? (
    <EventHandlerInner currentDir={currentDir.data}>
      {children}
    </EventHandlerInner>
  ) : (
    children
  )
}

const EventHandlerInner = (
  props: PropsWithChildren<{ currentDir: string }>,
) => {
  const { currentDir, children } = props
  const client = useQueryClient()
  const headInfo = useQuery(headInfoQuery(currentDir))

  useEffect(() => {
    const unlisten = listen('git-event', (event) => {
      match(event.payload)
        .with({ type: 'gitFolderModified' }, () => {
          client.invalidateQueries()
        })
        .with({ type: 'branchesListUpdated' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.branches.list(currentDir)],
          })
        })
        .with(
          { type: 'branchUpdated', name: P.string.select() },
          (branchName) => {
            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commitHistory.branch(
                  currentDir,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.branchDivergence.branch(
                  currentDir,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.branchDivergence.baseBranch(
                  currentDir,
                  branchName,
                ),
              ],
            })

            const currentBranch = getCurrentBranchName(headInfo.data)
            if (currentBranch === branchName) {
              client.invalidateQueries({
                queryKey: [queryKeys.directory.headInfo(currentDir)],
              })
            }
          },
        )
        .with({ type: 'headChanged' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(currentDir)],
          })
        })
        .with({ type: 'filesModified' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(currentDir)],
          })
        })
        .with({ type: 'indexUpdated' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.headInfo(currentDir)],
          })
        })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client, currentDir, headInfo.data])

  return children
}

export { EventHandler }
