import { useQueryUnstagedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { FileStatusListPagination } from '../List/Pagination'
import { UnstagedFileStatusItem } from './Item'

const UnstagedFiles = () => {
  const files = useQueryUnstagedFiles()

  return (
    <AccordionSection
      defaultOpen
      label={`Unstaged files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <FileStatusListPagination type="unstaged" files={files.data} />
      }
      className={cn('min-h-30 overflow-y-hidden')}
    >
      <FileStatusList
        files={files.data}
        status="unstaged"
        RenderItem={UnstagedFileStatusItem}
        itemSize={48}
      />
    </AccordionSection>
  )
}

export { UnstagedFiles }
