import {
  useSelectAndStageFilesInteraction,
  useSelectAndStashFilesInteraction,
  useSelectAndUnstageFilesInteraction,
} from '@/interactions/file'
import { useSettings } from '@/state/storage'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { propsWithCn } from '@/utils/styles'

interface MainToolbarProps extends Partial<Omit<ToolbarProps, 'fixed'>> {}

/**
 * Main app widget that displays a toolbar with the most important actions for file handling.
 */
const MainToolbar = (props: MainToolbarProps) => {
  const { ...toolbarProps } = props

  const stageFiles = useSelectAndStageFilesInteraction()
  const unstageFiles = useSelectAndUnstageFilesInteraction()
  const stashFiles = useSelectAndStashFilesInteraction()

  const settings = useSettings()

  return (
    <Toolbar {...propsWithCn(toolbarProps, 'grid-cols-[7fr_8fr_7fr]')} fixed>
      <ToolbarItem
        {...stageFiles}
        shortcut={settings.stageFilesShortcut}
        fixed
        status="primary"
        size="md"
        compact={false}
      />

      <ToolbarItem
        {...unstageFiles}
        shortcut={settings.unstageFilesShortcut}
        fixed
        status="primary"
        size="md"
        compact={false}
      />

      <ToolbarItem
        {...stashFiles}
        shortcut={settings.stashFilesShortcut}
        fixed
        status="primary"
        size="md"
        compact={false}
      />
    </Toolbar>
  )
}

export { MainToolbar, type MainToolbarProps }
