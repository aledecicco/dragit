import * as Ariakit from '@ariakit/react'
import { type ComponentType, useMemo } from 'react'

import type { FileType, FileTypes } from '@api/models'
import { useQueryFiles } from '@api/queries'
import { usePagesSync } from '@context/pages'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import {
  AccordionSection,
  type AccordionSectionProps,
} from '@ui/Accordion/Section'
import { cn, propsWithCn } from '@utils/styles'
import { mapFn } from '@utils/types'
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
  usePagesSync(type)

  const virtualizerOptions = useMemo(() => {
    return mapFn(filesQuery.data, (files) => ({
      getItemKey: (index: number) => files.items[index].path,
    }))
  }, [filesQuery.data])

  if (!filesQuery.data) {
    return (
      <div
        className={cn(
          'h-full bg-dark-500',
          'flex flex-col items-center justify-center',
        )}
      >
        <p className={cn('text-sm italic text-light-950/60')}>
          Loading {type} files...
        </p>
      </div>
    )
  }

  return (
    <AccordionSection
      defaultOpen
      label={`${type} files`}
      extraInfo={
        <FileStatusSectionPagination type={type} files={filesQuery.data} />
      }
      {...propsWithCn(accordionSectionProps, 'min-h-30 overflow-y-hidden')}
    >
      {filesQuery.data.items.length ? (
        <Ariakit.CompositeRow
          render={
            <VirtualizedDiv
              size="sm"
              items={filesQuery.data.items}
              RenderItem={FileStatusItem[type]}
              itemSize={ItemSize[type]}
              className={cn('w-full h-full')}
              options={virtualizerOptions}
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
