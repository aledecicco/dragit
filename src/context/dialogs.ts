import { Store, useStore } from '@tanstack/react-store'
import type { ReactNode } from 'react'

type DialogKey = string

interface Dialogs {
  mounted: Map<DialogKey, ReactNode>
}

const dialogs = new Store<Dialogs>({
  mounted: new Map(),
})

const useDialog = (): ReactNode | undefined => {
  const allDialogs = useStore(dialogs)

  let entry: [DialogKey, ReactNode] | undefined = undefined
  for (entry of allDialogs.mounted);

  return entry?.[1]
}

const showDialog = (key: DialogKey, dialog: ReactNode) => {
  console.log('show', key)
  dialogs.setState((dialogs) => {
    const newDialogs = new Map(dialogs.mounted)
    newDialogs.delete(key)
    newDialogs.set(key, dialog)
    return { mounted: newDialogs }
  })
}

const hideDialog = (key: DialogKey) => {
  console.log('hide', key)
  dialogs.setState((dialogs) => {
    const newDialogs = new Map(dialogs.mounted)
    newDialogs.delete(key)
    console.log(newDialogs)
    return { mounted: newDialogs }
  })
}

export { useDialog, showDialog, hideDialog, type Dialogs, type DialogKey }
