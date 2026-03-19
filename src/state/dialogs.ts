import type { ComponentType } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { AnyObject } from '@/utils/types'

type DialogKey = string

interface DialogEntry<T extends AnyObject> {
  DialogComponent: ComponentType<T>
  props: T
}

interface Dialogs {
  mounted: Map<DialogKey, DialogEntry<AnyObject>>
}

interface Setters {
  /**
   * Add a dialog to the top of the stack, or bump an existing one with the same key.
   *
   * @param key - The unique identifier of the dialog.
   * @param DialogComponent - The constructor of the dialog component to render.
   * @param props - The props to pass to the dialog component.
   */
  showDialog: <T extends AnyObject>(
    key: DialogKey,
    DialogComponent: ComponentType<T>,
    props: T,
  ) => void

  /**
   * Remove a dialog from the stack.
   *
   * @param key - The unique identifier of the dialog.
   */
  hideDialog: (key: DialogKey) => void
}

const useDialogsStore = create<Dialogs & Setters>()(
  immer((setState) => ({
    mounted: new Map(),

    showDialog: (key, DialogComponent, props) => {
      setState((state) => {
        state.mounted.delete(key)
        state.mounted.set(key, {
          DialogComponent: DialogComponent as ComponentType<AnyObject>,
          props: props as AnyObject,
        })
      })
    },

    hideDialog: (key) => {
      setState((state) => {
        state.mounted.delete(key)
      })
    },
  })),
)

/**
 * @returns The highest priority dialog that should be mounted.
 */
const useDialog = (): DialogEntry<AnyObject> | undefined => {
  const dialogs = useDialogsStore((state) => state.mounted)

  const lastKey = Array.from(dialogs.keys()).pop()
  if (!lastKey) return undefined

  return dialogs.get(lastKey)
}

/**
 * Display a dialog with highest priority.
 *
 * @param key - The unique key identifying the dialog.
 * @param DialogComponent - The constructor of the dialog component to render.
 * @param props - The props to pass to the dialog component.
 */
const showDialog = useDialogsStore.getState().showDialog

/**
 * Hide a dialog.
 *
 * @param key - The unique identifier of the dialog.
 */
const hideDialog = useDialogsStore.getState().hideDialog

export { useDialog, showDialog, hideDialog, type Dialogs, type DialogKey }
