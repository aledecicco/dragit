import { match } from 'ts-pattern'

import type { FileInfo, FileType } from '@/api/models'
import { useQueryFiles } from '@/api/queries'
import { getPageItems } from '@/api/utils'
import { useHandleFilesPageSync } from '@/context/pages'
import { QueryList } from '@/lib/QueryList'
import {
  AccordionSection,
  type AccordionSectionProps,
} from '@/ui/Accordion/Section'
import { propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { StagedFileStatusItem } from '../Item/Staged'
import { UnmergedFileStatusItem } from '../Item/Unmerged'
import { UnstagedFileStatusItem } from '../Item/Unstaged'
import { UntrackedFileStatusItem } from '../Item/Untracked'
import { FileStatusSectionPagination } from './Pagination'

interface FileStatusesSectionProps extends Partial<AccordionSectionProps> {
  /**
   * The status of the files being displayed.
   */
  type: FileType
}

/**
 * A section in the file statuses widget that displays files with a specific status.
 */
const FileStatusesSection = (props: FileStatusesSectionProps) => {
  const { type, ...accordionSectionProps } = props
  const filesQuery = useQueryFiles(type)
  useHandleFilesPageSync(type)

  return (
    <AccordionSection
      defaultOpen
      label={`${type} files`}
      extraInfo={<FileStatusSectionPagination type={type} />}
      {...propsWithCn(accordionSectionProps, 'min-h-30 overflow-y-hidden')}
    >
      <QueryList
        name={`${type} files`}
        query={filesQuery}
        getItems={getPageItems}
        renderItem={(file: FileInfo) =>
          match(file)
            .with({ status: 'staged' }, (file) => (
              <StagedFileStatusItem file={file} />
            ))
            .with({ status: 'unstaged' }, (file) => (
              <UnstagedFileStatusItem file={file} />
            ))
            .with({ status: 'unmerged' }, (file) => (
              <UnmergedFileStatusItem file={file} />
            ))
            .with({ status: 'untracked' }, (file) => (
              <UntrackedFileStatusItem file={file} />
            ))
            .exhaustive()
        }
        size="sm"
        itemSize={match(type)
          .with('staged', () => ItemSize.staged)
          .with('unstaged', () => ItemSize.unstaged)
          .with('unmerged', () => ItemSize.unmerged)
          .with('untracked', () => ItemSize.untracked)
          .exhaustive()}
        options={mapFn(filesQuery.data, (files) => ({
          getItemKey: (index: number) => files.items[index].path,
        }))}
        isStandalone={false}
      />
    </AccordionSection>
  )
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
