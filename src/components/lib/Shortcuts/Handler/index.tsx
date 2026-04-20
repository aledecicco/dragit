import type { PropsWithChildren } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'

interface ShortcutsHandlerProps extends PropsWithChildren {}

/**
 * Provides the app with global keyboard shortcuts.
 */
const ShortcutsHandler = (props: ShortcutsHandlerProps) => {
  const { children } = props

  return <HotkeysProvider>{children}</HotkeysProvider>
}

export { ShortcutsHandler, type ShortcutsHandlerProps }
