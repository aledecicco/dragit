import { type ComponentProps, Fragment } from 'react'
import { useKeyPress } from 'react-use'

import { cn, propsWithCn } from '@/utils/styles'

interface ShortcutCheatsheetProps extends ComponentProps<'ul'> {
  shortcuts: Shortcut[]
}

interface Shortcut {
  /**
   * The list of keys involved in the shortcut.
   */
  keys: ShortcutKey[]

  /**
   * The description of the shortcut.
   */
  label: string

  /**
   * Whether the keys should be pressed at the same time (key combination),
   * or if they are alternatives for the same action.
   */
  combined?: boolean
}

interface ShortcutKey {
  /**
   * The symbol displayed for the key.
   */
  symbol: string

  /**
   * The name of the key used for detection on keypress events.
   */
  keyName: string
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
          aria-label={`${shortcut.label}: ${shortcut.keys.map((shortcutKey) => shortcutKey.keyName).join(shortcut.combined ? '+' : ' or ')}`}
        >
          <div className={cn('flex flex-row items-center gap-x-0.5')}>
            {shortcut.keys.map((shortcutKey, index) => (
              <Fragment key={shortcutKey.symbol}>
                {!!shortcut.combined && index > 0 && '+'}
                <ShortcutKey
                  key={shortcutKey.symbol}
                  shortcutKey={shortcutKey}
                  withLabel={!shortcut.combined}
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

/**
 * Displays a single keyboard shortcut key that reacts to key presses.
 *
 * @param props.shortcutKey - The key to display.
 * @param props.withLabel - Whether to include an aria-label (usually excluded for key combinations).
 */
const ShortcutKey = (props: {
  shortcutKey: ShortcutKey
  withLabel: boolean
}) => {
  const [pressed] = useKeyPress(props.shortcutKey.keyName)

  return (
    <kbd
      className={cn(
        'bg-dark-600',
        'rounded-sm border-[0.5px] border-light-950/40',
        pressed ? 'pb-0.5 mt-px' : 'pb-0.75',
      )}
      aria-label={props.withLabel ? props.shortcutKey.keyName : undefined}
    >
      <div
        aria-hidden
        className={cn(
          'flex items-center justify-center',
          'h-[18px] min-w-[18px] p-1',
          pressed ? 'bg-dark-400' : 'bg-dark-500',
          'rounded-sm border-b-[0.5px] border-light-950/30',
          'text-light-800 text-2xs',
        )}
      >
        {props.shortcutKey.symbol}
      </div>
    </kbd>
  )
}

export { ShortcutCheatsheet, type ShortcutCheatsheetProps, type Shortcut }
