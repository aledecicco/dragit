import type { ComponentProps } from 'react'
import { useCallback } from 'react'

import type { WorktreeFileType } from '@/api/models'

import { WorktreeChanges } from '..'
import { UnstagedChangesItem } from './Item'

export const UNSTAGED_FILE_TYPES = [
  'unstaged',
  'untracked',
  'unmerged',
] as const satisfies WorktreeFileType[]

interface UnstagedWorktreeChangesProps extends ComponentProps<'div'> {}

/**
 * Main app widget displaying the unstaged changes in the worktree.
 */
const UnstagedWorktreeChanges = (props: UnstagedWorktreeChangesProps) => {
  const { ...divProps } = props

  const renderFile = useCallback(
    (file: typeof UNSTAGED_FILE_TYPES) => <UnstagedChangesItem file={file} />,
    [],
  )

  return (
    <WorktreeChanges
      {...divProps}
      label="unstaged changes"
      extraInfo={undefined}
      fileTypes={UNSTAGED_FILE_TYPES}
      renderFile={renderFile}
    />
  )
}

export { UnstagedWorktreeChanges, type UnstagedWorktreeChangesProps }
