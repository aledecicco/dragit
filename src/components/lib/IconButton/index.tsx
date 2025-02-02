import type { IconProps } from '@tabler/icons-react'
import type { ForwardRefExoticComponent } from 'react'
import { match } from 'ts-pattern'

import { Button, type ButtonProps } from '@lib/Button'

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'rounded'> {
  Icon: ForwardRefExoticComponent<IconProps>
}

const IconButton = (props: IconButtonProps) => {
  const { Icon, ...buttonProps } = props

  return (
    <Button {...buttonProps} rounded>
      <Icon
        size={match(buttonProps.size)
          .with('sm', () => 12)
          .with('md', () => 15)
          .with(undefined, () => 15)
          .with('lg', () => 18)
          .exhaustive()}
      />
    </Button>
  )
}

export { IconButton, type IconButtonProps }
