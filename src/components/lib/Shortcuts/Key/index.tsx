import { type ComponentProps, useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import { cn, propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

import { getShortcutKeyFromEvent } from '../utils'

interface ShortcutsKeyProps extends ComponentProps<'kbd'> {
  /**
   * The key to display.
   */
  shortcutKey: string

  /**
   * Whether the key should visually react to key presses.
   */
  reactive?: boolean

  /**
   * The size of the key.
   */
  size?: Size
}

/**
 * A single keyboard key that reacts to keypresses.
 */
const ShortcutKey = (props: ShortcutsKeyProps) => {
  const { shortcutKey, reactive = true, size = 'md', ...kbdProps } = props

  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!reactive) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (getShortcutKeyFromEvent(event) === shortcutKey.toLowerCase()) {
        setPressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (getShortcutKeyFromEvent(event) === shortcutKey.toLowerCase()) {
        setPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [shortcutKey, reactive])

  return (
    <kbd
      {...propsWithCn(
        kbdProps,
        'bg-dark-500',
        'rounded-sm border-[0.5px] border-light-950/40',
        reactive && pressed ? 'pb-0.5 mt-px' : 'pb-0.75',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'flex items-center justify-center',
          'rounded-sm border-b-[0.5px] border-light-950/30',
          'text-light-800 capitalize',
          match(size)
            .with('xs', () => 'h-4.5 min-w-4.5 text-2xs p-1')
            .with('sm', () => 'h-5 min-w-5 text-xs p-1.25')
            .with('md', () => 'h-6 min-w-6 text-sm p-1.5')
            .with('lg', () => 'h-7 min-w-7 text-base p-2')
            .exhaustive(),
          reactive && pressed ? 'bg-dark-300' : 'bg-dark-400',
        )}
      >
        {shortcutKey}
      </div>
    </kbd>
  )
}

export { ShortcutKey, type ShortcutsKeyProps }
