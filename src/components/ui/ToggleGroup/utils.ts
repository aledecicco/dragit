import * as Ariakit from '@ariakit/react'

export const useToggleHandler = <T extends string>(
  toggles: readonly T[],
  defaultValue?: T,
) => {
  const store = Ariakit.useRadioStore({
    defaultValue,
  })

  const value = Ariakit.useStoreState(store, (state) =>
    toggles.find((item) => item === state.value),
  )

  return { store, value }
}
