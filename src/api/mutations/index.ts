export { addRemoteKey, useAddRemote } from './addRemote'
export { addToIndexKey, useAddToIndex } from './addToIndex'
export { applyStashKey, useApplyStash } from './applyStash'
export { changeRemoteUrlKey, useChangeRemoteUrl } from './changeRemoteUrl'
export { checkoutLocalKey, useCheckoutLocal } from './checkoutLocal'
export { commitIndexKey, useCommitIndex } from './commitIndex'
export { discardStashKey, useDiscardStash } from './discardStash'
export { fetchRemoteKey, useFetchRemote } from './fetchRemote'
export { initRepositoryKey, useInitRepository } from './initRepository'
export { openFolderKey, useOpenFolder } from './openFolder'
export { pullBranchKey, usePullBranch } from './pullBranch'
export { pushBranchKey, usePushBranch } from './pushBranch'
export { removeFromIndexKey, useRemoveFromIndex } from './removeFromIndex'
export { removeFromTreeKey, useRemoveFromTree } from './removeFromTree'
export {
  removeRecentFolderKey,
  useRemoveRecentFolder,
} from './removeRecentFolder'
export { removeRemoteKey, useRemoveRemote } from './removeRemote'
export { renameRemoteKey, useRenameRemote } from './renameRemote'
export { saveStashKey, useSaveStash } from './saveStash'
export { setSettingsKey, useSetSettings } from './setSettings'
export { setUpstreamKey, useSetUpstream } from './setUpstream'

export const pathMutationKey = (path: string) =>
  ({
    path,
  }) as const
