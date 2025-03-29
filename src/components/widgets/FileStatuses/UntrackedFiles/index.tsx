import { useQueryUntrackedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { FileStatusListPagination } from '../List/Pagination'
import { UntrackedFileStatusItem } from './Item'

const UntrackedFiles = () => {
  const files = useQueryUntrackedFiles()

  return (
    <AccordionSection
      defaultOpen={false}
      label={`Untracked files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <FileStatusListPagination type="untracked" files={files.data} />
      }
      className={cn('min-h-30 overflow-y-hidden')}
    >
      <FileStatusList
        files={files.data}
        status="untracked"
        RenderItem={UntrackedFileStatusItem}
        itemSize={34}
      />
    </AccordionSection>
  )
}

export { UntrackedFiles }
