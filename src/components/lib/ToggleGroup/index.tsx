import * as Ariakit from '@ariakit/react'

import type { ButtonStatus } from '@/ui/Button'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import type { Size } from '@/utils/types'

import type { Glyph } from '../../ui/Icon'
import { DecoratedButton } from '../DecoratedButton'

interface ToggleItem<T extends string> {
  /**
   * The value and unique identifier of the toggle button.
   */
  value: T

  /**
   * The label of the toggle button.
   */
  label: string

  /**
   * The icon to display in the toggle button.
   */
  Glyph: Glyph
}

interface ToggleGroupProps<T extends string> extends ToolbarProps {
  /**
   * The size of the items in the group.
   */
  size?: Size

  /**
   * The list of items in the group.
   */
  toggles: ToggleItem<T>[]

  /**
   * The status of the items in the group.
   */
  status?: ButtonStatus

  /**
   * Extra props for the underlying provider.
   */
  radioProps?: Ariakit.RadioProviderProps
}

/**
 * A group of toggle buttons that only allows one to be active at a time.
 */
const ToggleGroup = <T extends string>(props: ToggleGroupProps<T>) => {
  const { size = 'md', toggles, status, radioProps, ...toolbarProps } = props

  return (
    <Ariakit.RadioProvider {...radioProps}>
      <Toolbar
        {...toolbarProps}
        render={<Ariakit.RadioGroup render={toolbarProps.render} />}
      >
        {toggles.map((item) => (
          <ToolbarItem
            key={item.value}
            render={
              <Ariakit.Radio
                value={item.value}
                render={
                  <DecoratedButton
                    label={item.label}
                    Glyph={item.Glyph}
                    status={status}
                    size={size}
                    compact
                  />
                }
              />
            }
          />
        ))}
      </Toolbar>
    </Ariakit.RadioProvider>
  )
}

export { ToggleGroup, type ToggleGroupProps, type ToggleItem }
