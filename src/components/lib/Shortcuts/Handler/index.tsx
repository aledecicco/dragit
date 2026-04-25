import type { PropsWithChildren } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'

import type { ShortcutScope } from '../utils'

interface ShortcutsHandlerProps extends PropsWithChildren {}

const initialScope: ShortcutScope = 'global'

/**
 * Provides the app with global keyboard shortcuts.
 */
const ShortcutsHandler = (props: ShortcutsHandlerProps) => {
  const { children } = props

  return (
    <HotkeysProvider initiallyActiveScopes={[initialScope]}>
      {children}
    </HotkeysProvider>
  )
}

export { ShortcutsHandler, type ShortcutsHandlerProps }
