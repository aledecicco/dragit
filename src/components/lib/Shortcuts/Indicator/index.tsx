import { Fragment } from 'react'
import * as Ariakit from '@ariakit/react'
import { useKeyPress } from 'react-use'
import { match } from 'ts-pattern'

import { useSettings } from '@/state/settings'
import type { ButtonStatus } from '@/ui/Button'
import { capitalize } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

import {
  getShortcutKeys,
  getShortcutSequence,
  SHORTCUT_SEPARATOR,
  useActiveShortcutScopes,
  useShortcutBinding,
  useShortcutScopesHandler,
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
  const [modifiersPressed, keyboardEvent] = useKeyPress((event) => {
    const modifiersCount =
      Number(shortcutKeys.has('ctrl') && event.ctrlKey) +
      Number(shortcutKeys.has('shift') && event.shiftKey) +
      Number(shortcutKeys.has('alt') && event.altKey) +
      Number(shortcutKeys.has('meta') && event.metaKey)

    return modifiersCount > 1
  })

  const keysLeft = keyboardEvent
    ? getShortcutSequence(shortcutKeys).filter((key) => {
        const isPressedModifier =
          (key === 'ctrl' && keyboardEvent.ctrlKey) ||
          (key === 'shift' && keyboardEvent.shiftKey) ||
          (key === 'alt' && keyboardEvent.altKey) ||
          (key === 'meta' && keyboardEvent.metaKey)

        return !isPressedModifier
      })
    : undefined

  useShortcutBinding(hotkey, () => {
    action()
  })

  const settings = useSettings()
  const shortcutScopes = useActiveShortcutScopes()

  const shouldShowIndicator =
    settings.showShortcutIndicators &&
    shortcutScopes.includes('app') &&
    modifiersPressed &&
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
          {keysLeft?.map((key) => (
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
