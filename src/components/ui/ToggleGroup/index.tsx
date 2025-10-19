import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

interface ToggleGroupProps extends Ariakit.RadioGroupProps {}

/**
 * A group of toggle buttons that only allows one to be active at a time.
 *
 * Should contain {@link ToggleGroupItem} components as children.
 */
const ToggleGroup = (props: ToggleGroupProps) => {
  const { ...radioProps } = props

  return (
    <Ariakit.RadioGroup
      {...propsWithCn(radioProps, 'grid grid-flow-col auto-cols-max')}
    />
  )
}

export { ToggleGroup, type ToggleGroupProps }
