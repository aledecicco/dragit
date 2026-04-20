import { useEffect } from 'react'

import { useDialog } from '@/state/dialogs'

import { useShortcutScopesHandler } from '../Shortcuts/utils'

/**
 * Component that handles the logic related to showing dialogs.
 */
const DialogsHandler = () => {
  const dialog = useDialog()

  const scopesHandler = useShortcutScopesHandler()

  useEffect(() => {
    if (dialog) {
      scopesHandler.disableScope('app')
    } else {
      scopesHandler.enableScope('app')
    }
  }, [dialog, scopesHandler])

  return dialog ? <dialog.DialogComponent {...dialog.props} /> : undefined
}

export { DialogsHandler }
