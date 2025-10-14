import * as Ariakit from '@ariakit/react'

import type { ToggleItem } from '.'

export const useToggleHandler = <T extends string>(
  toggles: ToggleItem<T>[],
  defaultValue?: T,
) => {
  const store = Ariakit.useRadioStore({
    defaultValue,
  })

  const value = Ariakit.useStoreState(store, (state) =>
    toggles.find((item) => item.value === state.value),
  )?.value

  return { store, value }
}
