import { Button, type ButtonProps } from '@ui/Button'
import { type Glyph, Icon } from '@ui/Icon'
import { Tooltip } from '@ui/Tooltip'

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
