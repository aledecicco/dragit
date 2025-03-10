import { Store, useStore } from '@tanstack/react-store'

import type { DialogProps } from '@lib/Dialog'

type DialogKey = string

interface Dialogs {
  mounted: Map<DialogKey, DialogProps>
}

const dialogs = new Store<Dialogs>({
  mounted: new Map(),
})

const useDialog = (): DialogProps | undefined => {
  const allDialogs = useStore(dialogs)

  let entry: [DialogKey, DialogProps] | undefined = undefined
  for (entry of allDialogs.mounted);

  return entry?.[1]
}

const showDialog = (key: DialogKey, props: DialogProps) => {
  dialogs.setState((dialogs) => {
    const newDialogs = new Map(dialogs.mounted)
    newDialogs.delete(key)
    newDialogs.set(key, props)
    return { mounted: newDialogs }
  })
}

const hideDialog = (key: DialogKey) => {
  dialogs.setState((dialogs) => {
    const newDialogs = new Map(dialogs.mounted)
    newDialogs.delete(key)
    return { mounted: newDialogs }
  })
}

export { useDialog, showDialog, hideDialog, type Dialogs, type DialogKey }
