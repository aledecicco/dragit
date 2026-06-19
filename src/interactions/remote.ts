import type { RemoteInfo, RemoteName } from '@/api/models'
import { useAddRemote } from '@/api/mutations/addRemote'
import { useMakeChangeRemoteUrl } from '@/api/mutations/changeRemoteUrl'
import { useMakeFetchRemote } from '@/api/mutations/fetchRemote'
import { useMakeRemoveRemote } from '@/api/mutations/removeRemote'
import { useMakeRenameRemote } from '@/api/mutations/renameRemote'
import { interaction } from '@/lib/ActionButton/utils'

export const useRenameRemoteInteraction = (remote: RemoteInfo) => {
  const renameRemote = useMakeRenameRemote()(remote.name)

  return (newName: string) =>
    interaction({
      action: renameRemote,
      argsRequester: () => newName,
      details: `rename remote "${remote.name}"`,
    })
}

export const useChangeRemoteUrlInteraction = (remote: RemoteInfo) => {
  const changeRemoteUrl = useMakeChangeRemoteUrl()(remote.name)

  return (newUrl: string) =>
    interaction({
      action: changeRemoteUrl,
      argsRequester: () => newUrl,
      details: `change URL for remote "${remote.name}"`,
    })
}

export const useRemoveRemoteInteraction = (remote: RemoteInfo) => {
  const removeRemote = useMakeRemoveRemote()(remote.name)

  return interaction({
    action: removeRemote,
    isDangerous: true,
    details: `delete remote "${remote.name}"`,
  })
}

export const useAddRemoteInteraction = () => {
  const addRemote = useAddRemote()

  return { action: addRemote, details: 'create new remote' }
}

export const useFetchRemoteInteraction = (remote: RemoteName | undefined) => {
  const fetchRemote = useMakeFetchRemote()

  return remote
    ? interaction({
        action: fetchRemote(remote),
        details: `fetch remote "${remote}"`,
      })
    : undefined
}
