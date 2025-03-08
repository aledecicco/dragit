import { useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { type PropsWithChildren, useEffect } from 'react'
import { P, match } from 'ts-pattern'

import { useSelectedBranches } from '@context/branches'
import { useCurrentDirectory, useDirectoryIsOpen } from '@context/directory'
import { queryKeys } from './queries'

const EventHandler = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()
  const isOpen = useDirectoryIsOpen()

  useEffect(() => {
    const unlisten = listen('dir-changed', () => {
      client.invalidateQueries({
        queryKey: queryKeys.currentDir,
      })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client])

  return isOpen ? <EventHandlerInner>{children}</EventHandlerInner> : children
}

const EventHandlerInner = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()
  const { branch: currentBranch } = useSelectedBranches()
  const currentDir = useCurrentDirectory()

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
            console.log(branchName)

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

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.branch(
                  currentDir,
                  branchName,
                ),
              ],
            })

            client.invalidateQueries({
              queryKey: [
                queryKeys.directory.commonAncestor.baseBranch(
                  currentDir,
                  branchName,
                ),
              ],
            })

            if (currentBranch && currentBranch.name === branchName) {
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
        .with({ type: 'configUpdated' }, () => {
          client.invalidateQueries({
            queryKey: [queryKeys.directory.branches.list(currentDir)],
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
  }, [client, currentDir, currentBranch])

  return children
}

export { EventHandler }
