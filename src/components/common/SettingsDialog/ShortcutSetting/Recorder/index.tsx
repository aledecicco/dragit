import { Fragment, useEffectEvent, useRef } from 'react'
import { IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import { useEffectOnce } from 'react-use'

import { useSetSettings } from '@/api/mutations/setSettings'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { ShortcutKey } from '@/lib/Shortcuts/Key'
import {
  formatShortcut,
  getShortcutSequence,
  SHORTCUT_SEPARATOR,
  type ShortcutKeys,
  type ShortcutRecorder,
} from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'

import type { StringSettingKey } from '../../utils'

interface ShortcutSettingRecorderProps extends Partial<DialogProps> {
  /**
   * The action being configured by the setting.
   */
  action: string

  /**
   * The key of the setting the shortcut input controls.
   */
  setting: StringSettingKey

  /**
   * The shortcut recorder instance to use in the dialog.
   */
  recorder: ShortcutRecorder
}

/**
 * A dialog that allows the user to record a shortcut for a specific action.
 */
const ShortcutSettingRecorder = (props: ShortcutSettingRecorderProps) => {
  const { action, setting, recorder, ...dialogProps } = props

  const setSettings = useSetSettings()
  const pressedKeys = useRef<ShortcutKeys>(new Set())

  const hasRecording = useEffectEvent(() => recorder.recorded.size > 0)

  const saveRecording = useEffectEvent(() => {
    triggerInteraction({
      action: setSettings,
      argsRequester: () => ({
        [setting]: formatShortcut(getShortcutSequence(recorder.recorded)),
      }),
    })
    recorder.stop()
  })

  useEffectOnce(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      if (pressedKeys.current.size === 0) {
        if (hasRecording() && e.key === 'Enter') {
          // If Enter is pressed with no other keys, we consider it as a signal to save the current recording.
          e.preventDefault()
          e.stopPropagation()
          saveRecording()
          return
        }

        // If no keys are currently pressed, this is a new recording attempt by the user.
        recorder.reset()
      }

      pressedKeys.current.add(e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
    }
  })

  return (
    <Dialog
      dialogKey={`${action}_recorder`}
      open
      showClose={false}
      backdrop={<div className={cn('bg-dark-950/95')} />}
      {...propsWithCn(
        dialogProps,
        'bg-transparent border-none max-w-full',
        'text-center',
      )}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        recorder.stop()
      }}
    >
      <DialogContent
        className={cn(
          'grid grid-rows-[max-content_1fr_max-content] items-center gap-6 max-w-full max-h-full',
        )}
      >
        <p className={cn('text-sm text-light-600')}>
          Press the desired key combination to{' '}
          <span className={cn('font-medium text-light-100')}>{action}</span>
        </p>

        <div
          className={cn(
            'flex flex-row justify-center flex-wrap gap-2',
            'w-full p-4 rounded-md bg-dark-800/75',
            'overflow-y-auto max-h-full',
          )}
        >
          {recorder.recorded.size > 0 ? (
            getShortcutSequence(recorder.recorded).map((key, index) => (
              <Fragment key={key}>
                {index > 0 && SHORTCUT_SEPARATOR}
                <ShortcutKey shortcutKey={key} reactive={false} size="lg" />
              </Fragment>
            ))
          ) : (
            <p className={cn('text-md text-light-900 p-1')}>Recording...</p>
          )}
        </div>

        <div className={cn('grid grid-cols-2 gap-1')}>
          <DecoratedButton
            label="Cancel"
            Glyph={IconCancel}
            status="neutral"
            variant="filled"
            onClick={() => recorder.stop()}
          />
          <DecoratedButton
            label="Save"
            Glyph={IconDeviceFloppy}
            status="primary"
            variant="filled"
            onClick={() => {
              saveRecording()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ShortcutSettingRecorder, type ShortcutSettingRecorderProps }
