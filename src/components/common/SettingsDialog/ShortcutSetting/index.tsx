import { type ComponentProps, useRef } from 'react'
import * as Ariakit from '@ariakit/react'

import { useShortcutRecorder } from '@/lib/Shortcuts/utils'
import { useSettings } from '@/state/storage'
import { Button } from '@/ui/Button'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'

import type { StringSettingKey } from '../utils'
import { ShortcutSettingRecorder } from './Recorder'

interface ShortcutSettingProps extends ComponentProps<'div'> {
  /**
   * The action being configured by the setting.
   */
  action: string

  /**
   * The key of the setting this shortcut input controls.
   */
  setting: StringSettingKey
}

/**
 * A single setting inside the settings dialog for a global shortcut.
 */
const ShortcutSetting = (props: ShortcutSettingProps) => {
  const { action, setting, ...divProps } = props

  const buttonRef = useRef<HTMLButtonElement>(null)

  const settings = useSettings()
  const recorder = useShortcutRecorder()

  return (
    <>
      <div
        {...propsWithCn(
          divProps,
          'flex flex-row gap-1.5 items-center p-2',
          'text-sm text-light-400',
          'transition-colors duration-150',
          'hover:bg-light-950/5 data-focus-visible:bg-light-950/5',
          'hover:data-focus-visible:bg-light-950/10',
        )}
        onClickCapture={(e) => {
          divProps.onClickCapture?.(e)
          buttonRef.current?.focus()
        }}
      >
        Press{' '}
        <Ariakit.CompositeItem
          render={
            <Button
              aria-label={`Shortcut to ${action}. Click to edit.`}
              className={cn('font-medium max-w-40')}
              onClick={() => {
                if (!recorder.isRecording) {
                  recorder.start()
                }
              }}
              ref={buttonRef}
            >
              <Marquee reverse={false}>{settings[setting]}</Marquee>
            </Button>
          }
        />{' '}
        to {action}
      </div>

      {recorder.isRecording && (
        <ShortcutSettingRecorder
          action={action}
          setting={setting}
          recorder={recorder}
        />
      )}
    </>
  )
}

export { ShortcutSetting, type ShortcutSettingProps }
