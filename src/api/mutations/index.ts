export { addRemoteKey, useAddRemote } from './addRemote'
export {
  addToIndexKey,
  useAddFiles,
  useMarkAsResolved,
  useStageFile,
} from './addToIndex'
export { applyStashKey, useApplyStash } from './applyStash'
export { changeRemoteUrlKey, useChangeRemoteUrl } from './changeRemoteUrl'
export {
  checkoutLocalKey,
  useCheckoutLocal,
  useSwitchBranches,
} from './checkoutLocal'
export { commitIndexKey, useCommitIndex } from './commitIndex'
export { discardStashKey, useDiscardStash } from './discardStash'
export { fetchRemoteKey, useFetchRemote } from './fetchRemote'
export { initRepositoryKey, useInitRepository } from './initRepository'
export { openFolderKey, useOpenFolder } from './openFolder'
export { pullBranchKey, usePullBranch } from './pullBranch'
export { pushBranchKey, useForcePushBranch, usePushBranch } from './pushBranch'
export { removeFromIndexKey, useUnstageFile } from './removeFromIndex'
export { removeFromTreeKey, useMarkAsRemoved } from './removeFromTree'
export {
  removeRecentFolderKey,
  useRemoveRecentFolder,
} from './removeRecentFolder'
export { removeRemoteKey, useRemoveRemote } from './removeRemote'
export { renameRemoteKey, useRenameRemote } from './renameRemote'
export { saveStashKey, useSaveStash } from './saveStash'
export { setSettingsKey, useSaveSettings } from './setSettings'
export { setUpstreamKey, useSetUpstream } from './setUpstream'

export const pathMutationKey = (repoPath: string) =>
  ({
    repoPath,
  }) as const
