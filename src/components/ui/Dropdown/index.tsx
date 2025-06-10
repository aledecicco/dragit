import * as Ariakit from '@ariakit/react'

import { Menu, type MenuProps } from '@ui/Menu'
import { cn } from '@utils/styles'

interface DropdownProps extends MenuProps {
  /**
   * The anchor element that triggers the menu when clicked.
   */
  anchor: NonNullable<Ariakit.MenuButtonProps['render']>
}

/**
 * Dropdown menu component that is triggered when a button is clicked.
 */
const Dropdown = (props: DropdownProps) => {
  const { anchor, ...menuProps } = props

  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton render={anchor} className={cn('group/menu')}>
        <Ariakit.MenuButtonArrow
          className={cn('group-aria-expanded/menu:rotate-180')}
        />
      </Ariakit.MenuButton>

      <Menu {...menuProps} />
    </Ariakit.MenuProvider>
  )
}

export { Dropdown, type DropdownProps }
