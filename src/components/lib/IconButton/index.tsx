import { forwardRef } from 'react'

import { Button, type ButtonProps } from '@lib/Button'
import { type Glyph, Icon } from '@lib/Icon'

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'rounded'> {
  Glyph: Glyph
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    const { Glyph, ...buttonProps } = props

    return (
      <Button {...buttonProps} rounded ref={ref}>
        <Icon Glyph={Glyph} size={buttonProps.size} />
      </Button>
    )
  },
)

export { IconButton, type IconButtonProps }
