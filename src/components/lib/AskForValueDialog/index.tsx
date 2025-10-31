import type { ComponentType } from 'react'

import { type DialogKey, showDialog } from '@/context/dialogs'
import { getUniqueId } from '@/context/ids'
import type { AnyObject } from '@/utils/types'

interface AskForValueProps<T extends AnyObject> {
  dialogKey: DialogKey
  submitValue: (value: T | undefined) => void
}

/**
 * Opens a dialog component that asks the user for a value.
 * Creates a promise that resolves when the user submits the value from the dialog.
 *
 * @param AskDialog - The dialog component to render, that must accept a submit callback.
 * @param dialogProps - Optional props to pass to the dialog component.
 *
 * @returns A promise that resolves with the value provided by the user.
 */
function askForValue<T extends AnyObject>(
  AskDialog: ComponentType<AskForValueProps<T>>,
): Promise<T>

function askForValue<T extends AnyObject, P>(
  AskDialog: ComponentType<AskForValueProps<T> & P>,
  dialogProps: P,
): Promise<T>

function askForValue<T extends AnyObject, P>(
  AskDialog: ComponentType<AskForValueProps<T> & P>,
  dialogProps?: P,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const dialogKey = getUniqueId()

    showDialog(dialogKey, AskDialog, {
      ...(dialogProps as P),
      dialogKey,
      submitValue: (value) => {
        if (value === undefined) {
          reject(new Error('Value not provided'))
        } else {
          resolve(value)
        }
      },
    })
  })
}

export { type AskForValueProps, askForValue }
