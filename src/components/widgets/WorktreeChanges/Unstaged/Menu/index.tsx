import { IconEye } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import type { FileOfType, UnmergedFileInfo } from '@/api/models'
import { useStageFile } from '@/api/mutations/addToIndex'
import {
  useAcceptAsIs,
  useAcceptDeletion,
  useAcceptFile,
  useAcceptOurs,
  useAcceptTheirs,
  useIgnoreDeletion,
  useIgnoreFile,
} from '@/api/mutations/solveFileConflict'
import { showWorktreeFileDiffDialog } from '@/common/WorktreeFileDiffDialog'
import { MenuItem } from '@/ui/Menu/Item'

import type { UNSTAGED_FILE_TYPES } from '..'

interface UnstagedFileMenuItemsProps {
  file: FileOfType<(typeof UNSTAGED_FILE_TYPES)[number]>
}

const UnstagedFileMenuItems = (props: UnstagedFileMenuItemsProps) => {
  const { file } = props

  const stage = useStageFile(file)

  return (
    <>
      {file.status === 'unmerged' ? (
        <UnmergedFileMenuItems file={file} />
      ) : (
        <MenuItem action={stage} />
      )}
      <MenuItem
        label="View Changes"
        Glyph={IconEye}
        onClick={() => showWorktreeFileDiffDialog(file)}
      />
    </>
  )
}

interface UnmergedFileMenuItemsProps {
  file: UnmergedFileInfo
}

const UnmergedFileMenuItems = (props: UnmergedFileMenuItemsProps) => {
  const { file } = props

  const acceptAsIs = useAcceptAsIs(file)
  const acceptOurs = useAcceptOurs(file)
  const acceptTheirs = useAcceptTheirs(file)
  const acceptDeletion = useAcceptDeletion(file)
  const ignoreDeletion = useIgnoreDeletion(file)
  const acceptNewFile = useAcceptFile(file)
  const ignoreNewFile = useIgnoreFile(file)

  return (
    <>
      {match(file.changes)
        .with(P.union('bothAdded', 'bothModified'), () => (
          <>
            <MenuItem action={acceptAsIs} />
            <MenuItem action={acceptOurs} />
            <MenuItem action={acceptTheirs} />
          </>
        ))
        .with(P.union('addedByUs', 'addedByThem'), () => (
          <>
            <MenuItem action={acceptNewFile} />
            <MenuItem action={ignoreNewFile} />
          </>
        ))
        .with('bothDeleted', () => <MenuItem action={acceptDeletion} />)
        .with(P.union('deletedByUs', 'deletedByThem'), () => (
          <>
            <MenuItem action={acceptDeletion} />
            <MenuItem action={ignoreDeletion} />
          </>
        ))
        .exhaustive()}
    </>
  )
}

export { UnstagedFileMenuItems }
