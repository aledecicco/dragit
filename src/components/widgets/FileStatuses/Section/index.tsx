import type { FileType, FileTypes } from '@api/models'
import * as Ariakit from '@ariakit/react'
import { type ComponentType, useMemo } from 'react'

import { useQueryFiles } from '@api/queries'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import {
  AccordionSection,
  type AccordionSectionProps,
} from '@ui/Accordion/Section'
import { cn, propsWithCn } from '@utils/styles'
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
  const files = useQueryFiles(type)

  const options = useMemo(() => {
    return files.data
      ? {
          getItemKey: (index: number) => files.data.items[index].path,
        }
      : undefined
  }, [files])

  return (
    <AccordionSection
      defaultOpen
      label={`${type} files`}
      extraInfo={<FileStatusSectionPagination type={type} files={files.data} />}
      {...propsWithCn(accordionSectionProps, 'min-h-30 overflow-y-hidden')}
    >
      {files.data?.items.length ? (
        <Ariakit.CompositeRow
          render={
            <VirtualizedDiv
              size="sm"
              items={files.data.items}
              RenderItem={FileStatusItem[type]}
              itemSize={ItemSize[type]}
              className={cn('w-full h-full')}
              options={options}
            />
          }
        />
      ) : (
        <p className={cn('text-sm text-light-950/50 italic p-3')}>
          No {type} files
        </p>
      )}
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
