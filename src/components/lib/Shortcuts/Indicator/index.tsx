import { Fragment, useEffect, useRef, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { useSettings } from '@/state/storage'
import type { ButtonStatus } from '@/ui/Button'
import { capitalize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

import {
  getShortcutKeyFromEvent,
  getShortcutKeys,
  getShortcutSequence,
  SHORTCUT_MODIFIERS,
  SHORTCUT_SEPARATOR,
  type ShortcutKeys,
  useActiveShortcutScopes,
  useShortcutBinding,
} from '../utils'

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
  const shortcutSequence = getShortcutSequence(shortcutKeys)

  const pressedKeys = useRef<ShortcutKeys>(new Set())
  const [keysLeft, setKeysLeft] = useState<string[]>()
  const [modifiersCount, setModifiersCount] = useState(0)

  useEffect(() => {
    const updateKeysLeft = () => {
      // If any of the currently pressed keys is not part of this shortcut, don't show the indicator.
      if (
        [...pressedKeys.current.values()].some((key) => !shortcutKeys.has(key))
      ) {
        setKeysLeft(undefined)
        return
      }

      // Store the keys in this shortcut that are left to be pressed for the shortcut to be triggered.
      setKeysLeft(
        shortcutSequence.filter((key) => {
          const isPressedModifier =
            SHORTCUT_MODIFIERS.includes(key) && pressedKeys.current.has(key)

          return !isPressedModifier
        }),
      )
    }

    const updateModifiersCount = () => {
      // Store the number of modifier keys in this shortcut that are currently pressed.
      const count = SHORTCUT_MODIFIERS.reduce((count, modifier) => {
        return (
          count +
          Number(
            shortcutKeys.has(modifier) && pressedKeys.current.has(modifier),
          )
        )
      }, 0)

      setModifiersCount(count)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      pressedKeys.current.add(getShortcutKeyFromEvent(e))
      updateKeysLeft()
      updateModifiersCount()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(getShortcutKeyFromEvent(e))
      updateKeysLeft()
      updateModifiersCount()
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
    }
  }, [shortcutKeys, shortcutSequence])

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
