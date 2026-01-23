import type { ComponentProps } from 'react'
import { useCallback } from 'react'

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

  const renderFile = useCallback(
    (file: typeof STAGED_FILE_TYPES) => <StagedChangesItem file={file} />,
    [],
  )

  return (
    <WorktreeChanges
      {...divProps}
      label="staged changes"
      extraInfo={undefined}
      fileTypes={STAGED_FILE_TYPES}
      renderFile={renderFile}
    />
  )
}

export { StagedWorktreeChanges, type StagedWorktreeChangesProps }
