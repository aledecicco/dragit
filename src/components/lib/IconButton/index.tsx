import type { ForwardRefExoticComponent } from 'react'
import { match } from 'ts-pattern'

import { Button, type ButtonProps } from '@lib/Button'
import { type Glyph, Icon } from '@lib/Icon'

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'rounded'> {
  Glyph: Glyph
}

const IconButton = (props: IconButtonProps) => {
  const { Glyph, ...buttonProps } = props

  return (
    <Button {...buttonProps} rounded>
      <Icon Glyph={Glyph} size={buttonProps.size} />
    </Button>
  )
}

export { IconButton, type IconButtonProps }
