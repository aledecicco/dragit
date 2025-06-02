import { type ComponentType, useMemo } from 'react'

import type { FileType, FileTypes } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { getPageItems } from '@api/utils'
import { useHandleFilesPageSync } from '@context/pages'
import { QueryList } from '@lib/QueryList'
import {
  AccordionSection,
  type AccordionSectionProps,
} from '@ui/Accordion/Section'
import { propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { usePrevious } from 'react-use'
import { StagedFileStatusItem } from '../Item/Staged'
import { UnmergedFileStatusItem } from '../Item/Unmerged'
import { UnstagedFileStatusItem } from '../Item/Unstaged'
import { UntrackedFileStatusItem } from '../Item/Untracked'
import { FileStatusSectionPagination } from './Pagination'

interface FileStatusesSectionProps<T extends FileType>
  extends Partial<AccordionSectionProps> {
  type: T
}

const FileStatusesSection = <T extends FileType>(
  props: FileStatusesSectionProps<T>,
) => {
  const { type, ...accordionSectionProps } = props
  const filesQuery = useQueryFiles([type])
  useHandleFilesPageSync(type)

  const virtualizerOptions = useMemo(() => {
    return mapFn(filesQuery.data, (files) => ({
      getItemKey: (index: number) => files.items[index].path,
    }))
  }, [filesQuery.data])

  const prevCount = usePrevious(filesQuery.data?.items.length)

  return (
    <AccordionSection
      defaultOpen
      label={`${type} files`}
      extraInfo={<FileStatusSectionPagination type={type} query={filesQuery} />}
      {...propsWithCn(accordionSectionProps, 'min-h-30 overflow-y-hidden')}
    >
      <QueryList
        query={filesQuery}
        getItems={getPageItems}
        name={`${type} files`}
        size="sm"
        itemSize={ItemSize[type]}
        RenderItem={FileStatusItem[type]}
        options={virtualizerOptions}
        isStandalone={false}
        placeholdersCount={Math.min(10, prevCount ?? 3)}
      />
    </AccordionSection>
  )
}

const FileStatusItem: {
  [T in FileType]: ComponentType<{ item: FileTypes[T] }>
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
