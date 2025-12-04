interface ValueRequesterProps<T> {
  submitValue: (value: T | undefined) => void
}

/**
 * Opens a component that asks the user for a value.
 * Creates a promise that resolves when the user submits the value from the dialog.
 *
 * @param AskDialog - The component to render, that must accept a submit callback.
 *
 * @returns A promise that resolves with the value provided by the user.
 */
const requestValue = <T,>(
  showValueRequester: (props: ValueRequesterProps<T>) => void,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const submitValue = (value: T | undefined) => {
      if (value === undefined) {
        reject(new Error('Value not provided'))
      } else {
        resolve(value)
      }
    }

    showValueRequester({
      submitValue,
    })
  })
}

export { requestValue, type ValueRequesterProps }
