import { IconPlaylistAdd } from '@tabler/icons-react'

import { useAddToIndex } from '@api/mutations'
import { useQueryUnstagedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { IconButton } from '@ui/IconButton'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { UnstagedFileStatusItem } from './Item'

const UnstagedFiles = () => {
  const stage = useAddToIndex()
  const files = useQueryUnstagedFiles()

  if (!files.data) {
    return (
      <p className={cn('text-sm text-light-950/50 italic p-3 min-h-30')}>
        Loading unstaged files
      </p>
    )
  }

  return (
    <AccordionSection
      defaultOpen
      label={`Unstaged files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <IconButton
          round={false}
          Glyph={IconPlaylistAdd}
          variant="neutral"
          label="Stage all"
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
        status="unstaged"
        RenderItem={UnstagedFileStatusItem}
        itemSize={48}
      />
    </AccordionSection>
  )
}

export { UnstagedFiles }
