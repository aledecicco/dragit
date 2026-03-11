import type { WorktreeFileInfo } from '@/api/models'
import { FilePath } from '@/common/File/Path'
import {
  CommandMenuItem,
  type CommandMenuItemProps,
} from '@/ui/CommandMenu/Item'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

import { FileSelectorDialog } from '..'

interface FileSelectorDialogItemProps extends CommandMenuItemProps {
  /**
   * The file to be displayed.
   */
  file: WorktreeFileInfo
}

/**
 * A single item in a {@link FileSelectorDialog}.
 */
const FileSelectorDialogItem = (props: FileSelectorDialogItemProps) => {
  const { file, ...itemProps } = props

  const { filedir, filename } = getPathLocation(file.path)

  return (
    <CommandMenuItem
      value={file.path}
      {...propsWithCn(itemProps, 'flex flex-col items-start py-2')}
    >
      <Marquee className={cn('text-sm text-light-500')}>{filename}</Marquee>

      <Marquee className={cn('text-xs text-light-900/80')}>
        <FilePath
          filepath={filedir}
          separatorProps={{ className: cn('text-light-700') }}
        />
      </Marquee>
    </CommandMenuItem>
  )
}

export { FileSelectorDialogItem, type FileSelectorDialogItemProps }
