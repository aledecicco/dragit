import { IconPlaylistAdd } from '@tabler/icons-react'

import { useAddToIndex } from '@api/mutations'
import { useQueryUntrackedFiles } from '@api/queries'
import { AccordionSection } from '@ui/Accordion/Section'
import { IconButton } from '@ui/IconButton'
import { cn } from '@utils/styles'
import { FileStatusList } from '../List'
import { UntrackedFileStatusItem } from './Item'

const UntrackedFiles = () => {
  const stage = useAddToIndex()
  const files = useQueryUntrackedFiles()

  if (!files.data) {
    return (
      <p className={cn('text-sm text-light-950/50 italic p-3 min-h-30')}>
        Loading untracked files
      </p>
    )
  }

  return (
    <AccordionSection
      defaultOpen={false}
      label={`Untracked files (${files.data?.items.length ?? '...'})`}
      extraInfo={
        <IconButton
          round={false}
          Glyph={IconPlaylistAdd}
          variant="neutral"
          label="Start tracking all"
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
        status="untracked"
        RenderItem={UntrackedFileStatusItem}
        itemSize={34}
      />
    </AccordionSection>
  )
}

export { UntrackedFiles }
