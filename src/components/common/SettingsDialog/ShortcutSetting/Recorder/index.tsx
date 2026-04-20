import { useEffectEvent, useRef } from 'react'
import { IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import { useEffectOnce } from 'react-use'

import { useSetSettings } from '@/api/mutations/setSettings'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { formatShortcut, type ShortcutRecorder } from '@/lib/Shortcuts/utils'
import { triggerInteraction } from '@/state/actions'
import { Dialog, type DialogProps } from '@/ui/Dialog'
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
  const pressedKeys = useRef(new Set<string>())

  const hasRecording = useEffectEvent(() => recorder.recorded.size > 0)

  const saveRecording = useEffectEvent(() => {
    triggerInteraction({
      action: setSettings,
      argsRequester: () => ({
        [setting]: formatShortcut(recorder.recorded),
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
        'bg-transparent border-none',
        'flex flex-col items-center gap-6',
        'text-center',
      )}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        recorder.stop()
      }}
    >
      <p className={cn('text-sm text-light-600')}>
        Press the desired key combination to{' '}
        <span className={cn('font-medium text-light-100')}>{action}</span>
      </p>

      <p
        className={cn(
          'text-lg text-light-100',
          recorder.recorded.size === 0 && 'text-light-600',
        )}
      >
        {recorder.recorded.size > 0
          ? formatShortcut(recorder.recorded)
          : 'Recording...'}
      </p>

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
    </Dialog>
  )
}

export { ShortcutSettingRecorder, type ShortcutSettingRecorderProps }
