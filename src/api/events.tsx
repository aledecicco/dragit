import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listen } from '@tauri-apps/api/event'
import { type PropsWithChildren, useEffect } from 'react'
import { match } from 'ts-pattern'

import { currentDirQuery, queryKeys } from './queries'

const EventHandler = (props: PropsWithChildren) => {
  const { children } = props
  const client = useQueryClient()
  const currentDir = useQuery(currentDirQuery)

  useEffect(() => {
    const unlisten = listen('dir-changed', () => {
      client.invalidateQueries({
        queryKey: queryKeys.currentDir,
      })
      client.invalidateQueries({
        queryKey: queryKeys.directory.all,
      })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client])

  useEffect(() => {
    const unlisten = listen('git-event', (event) => {
      match(event.payload)
        .with({ type: 'gitFolderModified' }, () => {
          if (currentDir.data) {
            client.invalidateQueries({
              queryKey: queryKeys.directory.isRepository(currentDir.data),
            })
          }
        })
        .with({ type: 'branchesUpdated' }, () => {
          if (currentDir.data) {
            client.invalidateQueries({
              queryKey: queryKeys.directory.branches.all(currentDir.data),
            })
          }
        })
        .with({ type: 'headChanged' }, () => {
          if (currentDir.data) {
            client.invalidateQueries({
              queryKey: queryKeys.directory.headInfo(currentDir.data),
            })
          }
        })
        .with({ type: 'filesModified' }, () => {
          if (currentDir.data) {
            client.invalidateQueries({
              queryKey: queryKeys.directory.headInfo(currentDir.data),
            })
          }
        })
        .with({ type: 'commitUpdated' }, () => {
          if (currentDir.data) {
            client.invalidateQueries({
              queryKey: queryKeys.directory.headInfo(currentDir.data),
            })
          }
        })
        .with({ type: 'commitMessageUpdated' }, () => {
          // TODO: invalidate commit status
        })
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [client, currentDir.data])

  return children
}

export { EventHandler }
