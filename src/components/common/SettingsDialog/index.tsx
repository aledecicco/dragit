import { useEffect } from 'react'
import {
  IconAdjustments,
  IconInfoCircle,
  IconSparklesFilled,
} from '@tabler/icons-react'

import { useShortcutScopesHandler } from '@/lib/Shortcuts/utils'
import { showDialog } from '@/state/dialogs'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { Icon } from '@/ui/Icon'
import { Tabs, useTabsHandler } from '@/ui/Tabs'
import { Tab } from '@/ui/Tabs/Item'
import { TabPanel } from '@/ui/Tabs/Panel'
import { cn, propsWithCn } from '@/utils/styles'

import { SettingsDialogAboutContent } from './AboutContent'
import { SettingsDialogAiContent } from './AiContent'
import { SettingsDialogPreferencesContent } from './PreferencesContent'

const SETTINGS_DIALOG_KEY = 'settings_dialog'

interface SettingsDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The tab to have initially open when the dialog is shown.
   */
  initialTab?: 'preferences' | 'about'
}

/**
 * Dialog that displays existing settings and allows managing them.
 */
const SettingsDialog = (props: SettingsDialogProps) => {
  const { initialTab = 'preferences', ...dialogProps } = props

  const scopesHandler = useShortcutScopesHandler()
  const tabsHandler = useTabsHandler(initialTab, {
    selectOnMove: false,
  })

  useEffect(() => {
    // When the settings dialog is open, we disable the 'global' shortcut scope
    // to prevent shortcuts from being triggered while the user is interacting with the settings.
    scopesHandler.disableScope('global')

    return () => {
      scopesHandler.enableScope('global')
    }
  }, [scopesHandler])

  return (
    <Dialog
      dialogKey={SETTINGS_DIALOG_KEY}
      {...propsWithCn(dialogProps, 'grid-cols-[max-content_600px] max-h-[70%]')}
    >
      <Tabs
        className={cn('bg-dark-700')}
        direction="vertical"
        store={tabsHandler.store}
        list={
          <>
            <Tab
              id="preferences"
              withDecoration={false}
              className={cn('rounded-none px-5 py-4')}
            >
              <Icon Glyph={IconAdjustments} size="lg" />
            </Tab>

            <Tab
              id="ai"
              withDecoration={false}
              className={cn('rounded-none px-5 py-4')}
            >
              <Icon Glyph={IconSparklesFilled} size="lg" />
            </Tab>

            <Tab
              id="about"
              withDecoration={false}
              className={cn('rounded-none px-5 py-4')}
            >
              <Icon Glyph={IconInfoCircle} size="lg" />
            </Tab>
          </>
        }
      >
        <TabPanel tabId="preferences">
          <SettingsDialogPreferencesContent />
        </TabPanel>

        <TabPanel tabId="ai">
          <SettingsDialogAiContent />
        </TabPanel>

        <TabPanel tabId="about">
          <SettingsDialogAboutContent />
        </TabPanel>
      </Tabs>
    </Dialog>
  )
}

const showSettingsDialog = (props?: Partial<SettingsDialogProps>) => {
  showDialog(SETTINGS_DIALOG_KEY, SettingsDialog, props ?? {})
}

export { SettingsDialog, showSettingsDialog, type SettingsDialogProps }
