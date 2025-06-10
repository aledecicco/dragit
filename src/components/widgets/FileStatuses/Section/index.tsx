import type { ComponentType } from 'react'

import type { FileType, FileTypes } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { getPageItems } from '@api/utils'
import { useHandleFilesPageSync } from '@context/pages'
import { QueryList } from '@lib/QueryList'
import {
  AccordionSection,
  type AccordionSectionProps,
} from '@ui/Accordion/Section'
import type { ListItemProps } from '@ui/ListItem'
import { propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { StagedFileStatusItem } from '../Item/Staged'
import { UnmergedFileStatusItem } from '../Item/Unmerged'
import { UnstagedFileStatusItem } from '../Item/Unstaged'
import { UntrackedFileStatusItem } from '../Item/Untracked'
import { FileStatusSectionPagination } from './Pagination'

interface FileStatusesSectionProps<T extends FileType>
  extends Partial<AccordionSectionProps> {
  /**
   * The status of the files being displayed.
   */
  type: T
}

/**
 * A section in the file statuses widget that displays files with a specific status.
 */
const FileStatusesSection = <T extends FileType>(
  props: FileStatusesSectionProps<T>,
) => {
  const { type, ...accordionSectionProps } = props
  const filesQuery = useQueryFiles(type)
  useHandleFilesPageSync(type)

  return (
    <AccordionSection
      defaultOpen
      label={`${type} files`}
      extraInfo={<FileStatusSectionPagination type={type} query={filesQuery} />}
      {...propsWithCn(accordionSectionProps, 'min-h-30 overflow-y-hidden')}
    >
      <QueryList
        name={`${type} files`}
        query={filesQuery}
        getItems={getPageItems}
        renderItem={(file: FileTypes[T]) => {
          const FileStatusItemComponent: ComponentType<
            { file: FileTypes[T] } & ListItemProps
          > = FileStatusItem[type]

          return <FileStatusItemComponent file={file} />
        }}
        size="sm"
        itemSize={ItemSize[type]}
        options={mapFn(filesQuery.data, (files) => ({
          getItemKey: (index: number) => files.items[index].path,
        }))}
        isStandalone={false}
      />
    </AccordionSection>
  )
}

const FileStatusItem: {
  [T in FileType]: ComponentType<{ file: FileTypes[T] } & ListItemProps>
} = {
  staged: StagedFileStatusItem,
  unstaged: UnstagedFileStatusItem,
  unmerged: UnmergedFileStatusItem,
  untracked: UntrackedFileStatusItem,
}

const ItemSize: {
  [T in FileType]: number
} = {
  staged: 48,
  unstaged: 48,
  unmerged: 48,
  untracked: 34,
}

export { FileStatusesSection }
