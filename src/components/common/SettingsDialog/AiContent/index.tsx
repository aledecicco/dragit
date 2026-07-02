import * as Ariakit from '@ariakit/react'

import { useQueryHasAiApiKey } from '@/api/queries/hasAiApiKey'
import { useSetAiApiKeyInteraction } from '@/interactions/ai'
import { triggerInteraction } from '@/state/actions'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn } from '@/utils/styles'

import { SettingsDialogSection } from '../Section'
import { TextSetting } from '../TextSetting'

/**
 * The content of the AI section of the settings dialog.
 */
const SettingsDialogAiContent = () => {
  const setAiApiKey = useSetAiApiKeyInteraction()
  const hasApiKeyQuery = useQueryHasAiApiKey()

  return (
    <DialogContent
      heading="AI"
      className={cn('h-full grid grid-rows-[max-content_1fr]')}
    >
      <div className={cn('overflow-hidden h-full')}>
        <Ariakit.CompositeProvider orientation="vertical" focusLoop>
          <Ariakit.Composite
            render={
              <div
                className={cn(
                  'p-2 rounded-md bg-dark-800 h-full overflow-auto',
                )}
              />
            }
          >
            <SettingsDialogSection
              label="API config"
              className={cn('auto-rows-auto')}
            >
              <TextSetting
                label="URL or command"
                placeholder="..."
                setting="aiBaseUrl"
                contentBefore="AI Agent URL: "
                className={cn('max-w-80 w-80')}
                buttonProps={{ className: cn('max-w-80') }}
              />

              <TextSetting
                label="model name"
                placeholder="..."
                setting="aiModel"
                contentBefore="AI Agent model: "
                className={cn('max-w-70')}
                buttonProps={{ className: cn('max-w-70') }}
              />

              <TextSetting
                label="API key"
                placeholder="Configure..."
                contentBefore="AI Agent API key: "
                className={cn('max-w-70')}
                buttonProps={{
                  className: cn('text-light-50/60 font-normal'),
                }}
                value={
                  hasApiKeyQuery.isFetching
                    ? 'Loading...'
                    : hasApiKeyQuery.data
                      ? 'Saved'
                      : 'Configure...'
                }
                defaultValue={''}
                setValue={async (newKey) => {
                  await triggerInteraction(setAiApiKey(newKey))
                  hasApiKeyQuery.refetch()
                }}
              />

              <TextSetting
                label="commit generation prompt"
                placeholder="Configure..."
                setting="aiSystemPrompt"
                contentBefore="Commit generation prompt: "
                className={cn('max-w-full w-full resize-none')}
                render={<textarea rows={5} />}
                buttonProps={{
                  children: 'Modify',
                  className: cn('text-light-50/60 font-normal'),
                }}
                divProps={{
                  className: cn('flex-wrap'),
                }}
              />
            </SettingsDialogSection>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
      </div>
    </DialogContent>
  )
}

export { SettingsDialogAiContent }
