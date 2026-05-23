import { Fragment, useRef, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { useEffectOnce } from 'react-use'
import { match } from 'ts-pattern'

import { useSettings } from '@/state/settings'
import type { ButtonStatus } from '@/ui/Button'
import { capitalize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

import {
  getShortcutKeys,
  getShortcutSequence,
  SHORTCUT_SEPARATOR,
  type ShortcutKeys,
  useActiveShortcutScopes,
  useShortcutBinding,
} from '../utils'

export const MODIFIERS = ['Control', 'Shift', 'Alt', 'Meta']

interface ShortcutIndicatorProps extends Ariakit.RoleProps {
  /**
   * The hotkey being tracked.
   */
  hotkey: string

  /**
   * The action triggered by the shortcut.
   */
  action: () => void

  /**
   * The label for the hotkey.
   */
  label?: string

  /**
   * The status of the indicator.
   */
  status?: ButtonStatus
}

/**
 * An indicator that pops up as a reminder that a shortcut is available.
 */
const ShortcutIndicator = (props: ShortcutIndicatorProps) => {
  const {
    hotkey,
    action,
    label,
    status = 'neutral',
    children,
    ...itemProps
  } = props

  const shortcutKeys = getShortcutKeys(hotkey)

  const pressedKeys = useRef<ShortcutKeys>(new Set())
  const [keysLeft, setKeysLeft] = useState<string[]>()
  const [modifiersCount, setModifiersCount] = useState(0)

  useEffectOnce(() => {
    const updateKeysLeft = () => {
      setKeysLeft(
        getShortcutSequence(shortcutKeys).filter((key) => {
          const isPressedModifier =
            (key === 'ctrl' && pressedKeys.current.has('Control')) ||
            (key === 'shift' && pressedKeys.current.has('Shift')) ||
            (key === 'alt' && pressedKeys.current.has('Alt')) ||
            (key === 'meta' && pressedKeys.current.has('Meta'))

          return !isPressedModifier
        }),
      )
    }

    const updateModifiersCount = () => {
      const count =
        Number(pressedKeys.current.has('Control')) +
        Number(pressedKeys.current.has('Shift')) +
        Number(pressedKeys.current.has('Alt')) +
        Number(pressedKeys.current.has('Meta'))

      setModifiersCount(count)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      pressedKeys.current.add(e.key)
      updateKeysLeft()
      updateModifiersCount()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key)
      updateKeysLeft()
      updateModifiersCount()
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
    }
  })

  useShortcutBinding(hotkey, () => {
    action()
  })

  const settings = useSettings()
  const shortcutScopes = useActiveShortcutScopes()

  const shouldShowIndicator =
    settings.showShortcutIndicators &&
    shortcutScopes.includes('app') &&
    modifiersCount > 1 &&
    !!keysLeft?.length

  return (
    <Ariakit.Role {...propsWithCn(itemProps, 'relative')}>
      {children}

      {shouldShowIndicator && (
        <div
          className={cn(
            'z-1 absolute -bottom-2 -right-2 rounded-md py-px px-1',
            'border text-xs text-light-100 text-nowrap',
            match(status)
              .with('neutral', () => 'bg-dark-100 border-light-950/30')
              .with('primary', () => 'bg-primary-700 border-primary-300/30')
              .with('cta', () => 'bg-accent-700 border-accent-300/30')
              .with('success', () => 'bg-success-700 border-success-300/30')
              .with('warning', () => 'bg-warning-700 border-warning-300/30')
              .with('danger', () => 'bg-danger-800 border-danger-300/30')
              .exhaustive(),
          )}
        >
          {keysLeft.map((key) => (
            <Fragment key={key}>
              {SHORTCUT_SEPARATOR}
              <b>{capitalize(key)}</b>
            </Fragment>
          ))}
          {!!label && `: ${label}`}
        </div>
      )}
    </Ariakit.Role>
  )
}

export { ShortcutIndicator, type ShortcutIndicatorProps }
