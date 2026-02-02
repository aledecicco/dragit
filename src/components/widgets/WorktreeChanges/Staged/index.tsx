import type { ComponentProps } from 'react'

import type { WorktreeFileType } from '@/api/models'

import { WorktreeChanges } from '..'
import { StagedChangesItem } from './Item'

export const STAGED_FILE_TYPES = [
  'staged',
] as const satisfies WorktreeFileType[]

interface StagedWorktreeChangesProps extends ComponentProps<'div'> {}

/**
 * Main app widget displaying the staged changes in the worktree.
 */
const StagedWorktreeChanges = (props: StagedWorktreeChangesProps) => {
  const { ...divProps } = props

  return (
    <WorktreeChanges
      {...divProps}
      label="staged changes"
      fileTypes={STAGED_FILE_TYPES}
      renderFile={(file, position) => (
        <StagedChangesItem file={file} itemIndex={position} />
      )}
    />
  )
}

export { StagedWorktreeChanges, type StagedWorktreeChangesProps }
