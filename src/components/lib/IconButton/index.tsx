import { Button, type ButtonProps } from '@lib/Button'
import { type Glyph, Icon } from '@lib/Icon'
import { Tooltip } from '@lib/Tooltip'

interface IconButtonProps extends ButtonProps {
  Glyph: Glyph
  label: string
}

const IconButton = (props: IconButtonProps) => {
  const { Glyph, label, ...buttonProps } = props

  return (
    <Tooltip
      description={label}
      anchor={
        <Button round aria-label={label} {...buttonProps}>
          <Icon Glyph={Glyph} size={buttonProps.size} />
        </Button>
      }
    />
  )
}

export { IconButton, type IconButtonProps }
