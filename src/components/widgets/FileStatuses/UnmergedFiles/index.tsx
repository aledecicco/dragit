import { useQueryUnmergedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { FileStatusListPagination } from '../List/Pagination'
import { UnmergedFileStatusItem } from './Item'

const UnmergedFiles = () => {
  const files = useQueryUnmergedFiles()

  return (
    <AccordionSection
      defaultOpen
      label={`Unmerged files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <FileStatusListPagination type="unmerged" files={files.data} />
      }
      className={cn('min-h-30 overflow-y-hidden')}
    >
      <FileStatusList
        files={files.data}
        status="unmerged"
        RenderItem={UnmergedFileStatusItem}
        itemSize={48}
      />
    </AccordionSection>
  )
}

export { UnmergedFiles }
