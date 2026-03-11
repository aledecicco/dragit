interface ValueRequesterProps<T> {
  /**
   * Callback to submit a value.
   *
   * @param value - The provided value. If the component is closed without submitting a value, this will be undefined.
   */
  submitValue: (value: T | undefined) => void
}

/**
 * Opens a component that asks the user for a value.
 * Creates a promise that resolves when the user submits the value from the component.
 *
 * @param showValueRequester - A callback that shows the component that requests the value from the user.
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
