import type { ComponentProps } from 'react'

import type { WorktreeFileType } from '@/api/models'

import { WorktreeChanges } from '..'
import { StagedChangesItem } from './Item'

export const FILE_TYPES = ['staged'] as const satisfies WorktreeFileType[]

interface StagedWorktreeChangesProps extends ComponentProps<'div'> {}

const StagedWorktreeChanges = (props: StagedWorktreeChangesProps) => {
  const { ...divProps } = props

  return (
    <WorktreeChanges
      {...divProps}
      label="staged changes"
      extraInfo={undefined}
      fileTypes={FILE_TYPES}
      renderFile={(file) => <StagedChangesItem file={file} />}
    />
  )
}

export { StagedWorktreeChanges, type StagedWorktreeChangesProps }
