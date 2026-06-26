import type { BranchName, CommitId, TagInfo } from '@/api/models'
import { useMakeCheckoutTag } from '@/api/mutations/checkout'
import {
  useMakeBranchOff,
  useMakeCreateBranchAt,
} from '@/api/mutations/createBranch'
import { useMakeTagBranch, useMakeTagCommit } from '@/api/mutations/createTag'
import { useDeleteTags, useMakeDeleteTag } from '@/api/mutations/deleteTags'
import { useMakeMergeTag } from '@/api/mutations/merge'
import { usePushTag } from '@/api/mutations/pushTag'
import { requestBranchName } from '@/common/CreateBranchDialog'
import { requestTagParams } from '@/common/CreateTagDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import type { AnyInteraction } from '@/state/actions'
import { pluralize } from '@/utils/string'

export const useCheckoutTagInteraction = (tag: TagInfo) => {
  const checkout = useMakeCheckoutTag()(tag)

  return interaction({
    action: checkout,
    details: `checkout tag "${tag.name}"`,
  })
}

export const usePushTagInteraction = (tag: TagInfo) => {
  const push = usePushTag(tag)

  return interaction({ action: push, details: `push tag "${tag.name}"` })
}

export const useCreateBranchAtTagInteraction = (tag: TagInfo) => {
  const createBranch = useMakeCreateBranchAt()(tag.name)

  return interaction({
    action: createBranch,
    argsRequester: () => requestBranchName(`#${tag.reference}`),
    details: `create a new branch at tag "${tag.name}"`,
  })
}

export const useBranchOffTagInteraction = (tag: TagInfo) => {
  const branchOff = useMakeBranchOff()(tag.name)

  return interaction({
    action: branchOff,
    argsRequester: () => requestBranchName(`#${tag.reference}`),
    details: `branch off of tag "${tag.name}"`,
  })
}

export const useMergeSomeTagInteraction = () => {
  const makeMerge = useMakeMergeTag()

  return (tag: TagInfo) =>
    interaction({
      action: makeMerge(tag),
      details: `merge tag "${tag.name}" into worktree`,
    })
}

export const useMergeTagInteraction = (tag: TagInfo) => {
  const mergeSome = useMergeSomeTagInteraction()
  return mergeSome(tag)
}

export const useDeleteTagInteraction = (tag: TagInfo) => {
  const deleteTag = useMakeDeleteTag()(tag)

  return interaction({
    action: deleteTag,
    isDangerous: true,
    details: `delete tag "${tag.name}"`,
  })
}

export const useSingleTagInteractions = (tag: TagInfo) => {
  const checkout = useCheckoutTagInteraction(tag)
  const push = usePushTagInteraction(tag)
  const createBranch = useCreateBranchAtTagInteraction(tag)
  const branchOff = useBranchOffTagInteraction(tag)
  const merge = useMergeTagInteraction(tag)
  const deleteTag = useDeleteTagInteraction(tag)

  return [
    group(checkout, push),
    group(createBranch, branchOff, merge),
    group(deleteTag),
  ]
}

export const useTagSomeCommitInteraction = () => {
  const makeTagCommit = useMakeTagCommit()

  return (commit: CommitId) =>
    interaction({
      action: makeTagCommit(commit),
      argsRequester: () => requestTagParams(`#${commit}`),
      details: `tag commit #${commit}`,
    })
}

export const useTagSomeBranchInteraction = () => {
  const makeTagBranch = useMakeTagBranch()

  return (branch: BranchName) =>
    interaction({
      action: makeTagBranch(branch),
      argsRequester: () => requestTagParams(branch),
      details: `tag branch "${branch}"`,
    })
}

export const useDeleteTagsInteraction = () => {
  const deleteTags = useDeleteTags()

  return (tags: TagInfo[]) =>
    interaction({
      action: deleteTags,
      argsRequester: () => tags,
      isDangerous: true,
      details: `delete ${pluralize('tag', tags.length, true)}`,
    })
}

export const useGetTagsListInteractions = () => {
  const deleteTagsInteraction = useDeleteTagsInteraction()

  return (tags: TagInfo[]): AnyInteraction[][] => [
    [deleteTagsInteraction(tags)],
  ]
}
