import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

interface ToggleGroupProps extends Ariakit.RadioGroupProps {
  /**
   * If `true`, it's assumed that the toggle group has a fixed width, and each item will grow proportionally to fill the available space.
   * If `false`, each item will take only as much space as it needs.
   */
  fixed?: boolean
}

/**
 * A group of toggle buttons that only allows one to be active at a time.
 *
 * Should contain {@link ToggleGroupItem} components as children.
 */
const ToggleGroup = (props: ToggleGroupProps) => {
  const { fixed = false, ...radioProps } = props

  return (
    <Ariakit.RadioGroup
      {...propsWithCn(
        radioProps,
        'grid grid-flow-col',
        fixed ? 'auto-cols-fr' : 'auto-cols-max',
      )}
    />
  )
}

const useToggleHandler = <T extends string>(
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

export { ToggleGroup, useToggleHandler, type ToggleGroupProps }
