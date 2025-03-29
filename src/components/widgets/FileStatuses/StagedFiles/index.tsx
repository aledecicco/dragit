import { useQueryStagedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { FileStatusListPagination } from '../List/Pagination'
import { StagedFileStatusItem } from './Item'

const StagedFiles = () => {
  const files = useQueryStagedFiles()

  return (
    <AccordionSection
      defaultOpen
      label={`Staged files (${files.data?.items.length ?? '...'})`}
      extraInfo={<FileStatusListPagination type="staged" files={files.data} />}
      className={cn('min-h-30 overflow-y-hidden')}
    >
      <FileStatusList
        files={files.data}
        status="staged"
        RenderItem={StagedFileStatusItem}
        itemSize={48}
      />
    </AccordionSection>
  )
}

export { StagedFiles }
