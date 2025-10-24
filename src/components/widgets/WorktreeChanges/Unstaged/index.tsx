import type { ComponentProps } from 'react'

import type { WorktreeFileType } from '@/api/models'

import { WorktreeChanges } from '..'
import { UnstagedChangesItem } from './Item'

export const UNSTAGED_FILE_TYPES = [
  'unstaged',
  'untracked',
  'unmerged',
] as const satisfies WorktreeFileType[]

interface UnstagedWorktreeChangesProps extends ComponentProps<'div'> {}

const UnstagedWorktreeChanges = (props: UnstagedWorktreeChangesProps) => {
  const { ...divProps } = props

  return (
    <WorktreeChanges
      {...divProps}
      label="unstaged changes"
      extraInfo={undefined}
      fileTypes={UNSTAGED_FILE_TYPES}
      renderFile={(file) => <UnstagedChangesItem file={file} />}
    />
  )
}

export { UnstagedWorktreeChanges, type UnstagedWorktreeChangesProps }
