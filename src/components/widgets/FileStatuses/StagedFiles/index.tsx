import { IconPlaylistX } from '@tabler/icons-react'

import { useRemoveFromIndex } from '@api/mutations'
import { useQueryStagedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { IconButton } from '@ui/IconButton'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { StagedFileStatusItem } from './Item'

const StagedFiles = () => {
  const files = useQueryStagedFiles()
  const unstage = useRemoveFromIndex()

  if (!files.data) {
    return (
      <p className={cn('text-sm text-light-950/50 italic p-3 min-h-30')}>
        Loading staged files
      </p>
    )
  }

  return (
    <AccordionSection
      defaultOpen
      label={`Staged files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <IconButton
          round={false}
          Glyph={IconPlaylistX}
          label="Unstage all"
          variant="neutral"
          size="sm"
          disabled={!files.data?.items.length || unstage.isPending}
          onClick={() => {
            unstage.mutate({ files: ['.'] })
          }}
        />
      }
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
