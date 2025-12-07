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

import type { UNSTAGED_FILE_TYPES } from '../..'

interface UnstagedFileContextMenuProps {
  file: FileOfType<(typeof UNSTAGED_FILE_TYPES)[number]>
}

const UnstagedFileContextMenu = (props: UnstagedFileContextMenuProps) => {
  const { file } = props

  const stage = useStageFile(file)

  return (
    <>
      {file.status === 'unmerged' ? (
        <UnmergedFileMenuItems file={file} />
      ) : (
        <MenuItem mainAction={stage} />
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
            <MenuItem mainAction={acceptAsIs} />
            <MenuItem mainAction={acceptOurs} />
            <MenuItem mainAction={acceptTheirs} />
          </>
        ))
        .with(P.union('addedByUs', 'addedByThem'), () => (
          <>
            <MenuItem mainAction={acceptNewFile} />
            <MenuItem mainAction={ignoreNewFile} />
          </>
        ))
        .with('bothDeleted', () => <MenuItem mainAction={acceptDeletion} />)
        .with(P.union('deletedByUs', 'deletedByThem'), () => (
          <>
            <MenuItem mainAction={acceptDeletion} />
            <MenuItem mainAction={ignoreDeletion} />
          </>
        ))
        .exhaustive()}
    </>
  )
}

export { UnstagedFileContextMenu }
