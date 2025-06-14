import type { ReactNode } from 'react'
import { Store, useStore } from '@tanstack/react-store'

type DialogKey = string

interface Dialogs {
  mounted: Map<DialogKey, ReactNode>
}

const dialogs = new Store<Dialogs>({
  mounted: new Map(),
})

/**
 * @returns The highest priority dialog that should be mounted.
 */
const useDialog = (): ReactNode | undefined => {
  const allDialogs = useStore(dialogs)

  let entry: [DialogKey, ReactNode] | undefined
  for (entry of allDialogs.mounted);

  return entry?.[1]
}

/**
 * Add a dialog to the top of the stack, or bump an existing one with the same key.
 *
 * @param key - The unique identifier of the dialog.
 * @param dialog - The content of the dialog.
 */
const showDialog = (key: DialogKey, dialog: ReactNode) => {
  dialogs.setState((dialogs) => {
    const newDialogs = new Map(dialogs.mounted)
    newDialogs.delete(key)
    newDialogs.set(key, dialog)
    return { mounted: newDialogs }
  })
}

/**
 * Remove a dialog from the stack.
 *
 * @param key - The unique identifier of the dialog to remove.
 */
const hideDialog = (key: DialogKey) => {
  dialogs.setState((dialogs) => {
    const newDialogs = new Map(dialogs.mounted)
    newDialogs.delete(key)
    return { mounted: newDialogs }
  })
}

export { useDialog, showDialog, hideDialog, type Dialogs, type DialogKey }
