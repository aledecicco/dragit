import { type ComponentProps, Fragment } from 'react'

import { cn, propsWithCn } from '@/utils/styles'

import { ShortcutKey } from '../Key'
import {
  formatShortcut,
  SHORTCUT_SEPARATOR,
  type ShortcutSequence,
} from '../utils'

interface ShortcutCheatsheetProps extends ComponentProps<'ul'> {
  /**
   * The list of shortcut helpers to display.
   */
  shortcuts: Shortcut[]
}

interface Shortcut {
  /**
   * The list of keys involved in the shortcut.
   */
  sequence: ShortcutSequence

  /**
   * The description of the shortcut.
   */
  label: string
}
/**
 * Displays a set of accessible keyboard shortcuts that react to key presses.
 */
const ShortcutCheatsheet = (props: ShortcutCheatsheetProps) => {
  const { shortcuts, ...listProps } = props

  return (
    <ul {...propsWithCn(listProps, 'flex flex-row gap-x-4 justify-center')}>
      {shortcuts.map((shortcut) => (
        <li
          key={shortcut.label}
          className={cn(
            'flex flex-row items-center gap-x-1 text-xs text-light-700',
          )}
          aria-label={`${shortcut.label}: ${formatShortcut(shortcut.sequence)}`}
        >
          <div className={cn('flex flex-row items-center gap-x-0.5')}>
            {shortcut.sequence.map((shortcutKey, index) => (
              <Fragment key={shortcutKey}>
                {index > 0 && SHORTCUT_SEPARATOR}
                <ShortcutKey
                  key={shortcutKey}
                  shortcutKey={shortcutKey}
                  reactive
                  size="xs"
                />
              </Fragment>
            ))}
          </div>

          {shortcut.label}
        </li>
      ))}
    </ul>
  )
}

export { ShortcutCheatsheet, type ShortcutCheatsheetProps, type Shortcut }
