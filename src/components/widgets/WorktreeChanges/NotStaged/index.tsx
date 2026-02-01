import type { ComponentProps } from 'react'

import type { WorktreeFileType } from '@/api/models'

import { WorktreeChanges } from '..'
import { NotStagedChangesItem } from './Item'

export const NOT_STAGED_FILE_TYPES = [
  'unstaged',
  'untracked',
  'unmerged',
] as const satisfies WorktreeFileType[]

interface NotStagedWorktreeChangesProps extends ComponentProps<'div'> {}

/**
 * Main app widget displaying the not-staged changes in the worktree.
 */
const NotStagedWorktreeChanges = (props: NotStagedWorktreeChangesProps) => {
  const { ...divProps } = props

  return (
    <WorktreeChanges
      {...divProps}
      label="unstaged changes"
      extraInfo={undefined}
      fileTypes={NOT_STAGED_FILE_TYPES}
      renderFile={(file, position) => (
        <NotStagedChangesItem file={file} itemIndex={position} />
      )}
    />
  )
}

export { NotStagedWorktreeChanges, type NotStagedWorktreeChangesProps }
