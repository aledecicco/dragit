import * as Ariakit from '@ariakit/react'

import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'

interface ToggleGroupProps extends ToolbarProps {
  /**
   * Extra props for the underlying provider.
   */
  radioProps?: Ariakit.RadioProviderProps
}

/**
 * A group of toggle buttons that only allows one to be active at a time.
 *
 * Should contain {@link ToggleGroupItem} components as children.
 */
const ToggleGroup = (props: ToggleGroupProps) => {
  const { radioProps, ...toolbarProps } = props

  return (
    <Ariakit.RadioProvider {...radioProps}>
      <Ariakit.RadioGroup render={<Toolbar {...toolbarProps} />} />
    </Ariakit.RadioProvider>
  )
}

export { ToggleGroup, type ToggleGroupProps }
