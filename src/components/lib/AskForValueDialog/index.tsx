import type { ComponentType } from 'react'

import { type DialogKey, showDialog } from '@/context/dialogs'
import { getUniqueId } from '@/context/ids'
import type { AnyObject } from '@/utils/types'

interface AskForValueProps<T extends AnyObject> {
  dialogKey: DialogKey
  submitValue: (value: T | undefined) => void
}

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

    showDialog(
      dialogKey,
      <AskDialog
        {...(dialogProps as P)}
        dialogKey={dialogKey}
        submitValue={(value) => {
          if (value === undefined) {
            reject(new Error('Value not provided'))
          } else {
            resolve(value)
          }
        }}
      />,
    )
  })
}

export { type AskForValueProps, askForValue }
