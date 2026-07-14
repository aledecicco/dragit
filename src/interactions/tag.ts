import type { BranchName, CommitId, TagInfo, TagName } from '@/api/models'
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
import { pluralize } from '@/utils/string'

import { compareTagInteraction } from './view'

export const useCheckoutTagInteraction = (tag: TagName) => {
  const checkout = useMakeCheckoutTag()(tag)

  return interaction({
    action: checkout,
    details: `checkout tag "${tag}"`,
  })
}

export const usePushTagInteraction = (tag: TagName) => {
  const push = usePushTag(tag)

  return interaction({ action: push, details: `push tag "${tag}"` })
}

export const useCreateBranchAtTagInteraction = (tag: TagName) => {
  const createBranch = useMakeCreateBranchAt()(tag)

  return interaction({
    action: createBranch,
    argsRequester: () => requestBranchName(`tag "${tag}"`),
    details: `create a new branch at tag "${tag}"`,
  })
}

export const useBranchOffTagInteraction = (tag: TagName) => {
  const branchOff = useMakeBranchOff()(tag)

  return interaction({
    action: branchOff,
    argsRequester: () => requestBranchName(`tag "${tag}"`),
    details: `branch off of tag "${tag}"`,
  })
}

export const useMergeSomeTagInteraction = () => {
  const makeMerge = useMakeMergeTag()

  return (tag: TagName) =>
    interaction({
      action: makeMerge(tag),
      details: `merge tag "${tag}" into worktree`,
    })
}

export const useMergeTagInteraction = (tag: TagName) => {
  const mergeSome = useMergeSomeTagInteraction()
  return mergeSome(tag)
}

export const useDeleteTagInteraction = (tag: TagName) => {
  const deleteTag = useMakeDeleteTag()(tag)

  return interaction({
    action: deleteTag,
    isDangerous: true,
    details: `delete tag "${tag}"`,
  })
}

export const useSingleTagInteractions = (tag: TagInfo) => {
  const checkout = useCheckoutTagInteraction(tag.name)
  const push = usePushTagInteraction(tag.name)
  const createBranch = useCreateBranchAtTagInteraction(tag.name)
  const branchOff = useBranchOffTagInteraction(tag.name)
  const merge = useMergeTagInteraction(tag.name)
  const deleteTag = useDeleteTagInteraction(tag.name)
  const compare = compareTagInteraction(tag.name)

  return [
    group(checkout, push),
    group(createBranch, branchOff, merge),
    group(compare),
    group(deleteTag),
  ]
}

export const useTagSomeCommitInteraction = () => {
  const makeTagCommit = useMakeTagCommit()

  return (commit: CommitId, defaultName?: TagName) =>
    interaction({
      action: makeTagCommit(commit),
      argsRequester: () => requestTagParams(`commit #${commit}`, defaultName),
      details: `tag commit #${commit}`,
    })
}

export const useTagSomeBranchInteraction = () => {
  const makeTagBranch = useMakeTagBranch()

  return (branch: BranchName, defaultName?: TagName) =>
    interaction({
      action: makeTagBranch(branch),
      argsRequester: () => requestTagParams(`branch "${branch}"`, defaultName),
      details: `tag branch "${branch}"`,
    })
}

export const useDeleteTagsInteraction = () => {
  const deleteTags = useDeleteTags()

  return (tags: TagName[]) =>
    interaction({
      action: deleteTags,
      argsRequester: () => tags,
      isDangerous: true,
      details: `delete ${pluralize('tag', tags.length, true)}`,
    })
}

export const useGetTagsListInteractions = () => {
  const deleteTagsInteraction = useDeleteTagsInteraction()

  return (tags: TagInfo[]) => [
    group(deleteTagsInteraction(tags.map((tag) => tag.name))),
  ]
}
