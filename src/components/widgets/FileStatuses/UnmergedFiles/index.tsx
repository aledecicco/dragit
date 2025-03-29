import { IconListCheck } from '@tabler/icons-react'

import { useAddToIndex } from '@api/mutations'
import { useQueryUnmergedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { IconButton } from '@ui/IconButton'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { UnmergedFileStatusItem } from './Item'

const UnmergedFiles = () => {
  const stage = useAddToIndex()
  const files = useQueryUnmergedFiles()

  if (!files.data) {
    return (
      <p className={cn('text-sm text-light-950/50 italic p-3 min-h-30')}>
        Loading unmerged files
      </p>
    )
  }

  return (
    <AccordionSection
      defaultOpen
      label={`Unmerged files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <IconButton
          round={false}
          Glyph={IconListCheck}
          label="Mark all as resolved"
          variant="neutral"
          size="sm"
          disabled={!files.data?.items.length || stage.isPending}
          onClick={() => {
            stage.mutate({ files: ['.'] })
          }}
        />
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
