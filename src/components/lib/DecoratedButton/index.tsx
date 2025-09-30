import { Button, type ButtonProps } from '@/ui/Button'
import { type Glyph, Icon, type IconProps } from '@/ui/Icon'
import { Tooltip } from '@/ui/Tooltip'

interface DecoratedButtonProps extends ButtonProps {
  /**
   * The label of the button.
   */
  label: string

  /**
   * The icon to display in the button.
   */
  Glyph: Glyph

  /**
   * Whether to display the button in its compact form,
   * showing only its icon, and with its label in a tooltip.
   */
  compact?: boolean

  /**
   * Additional props to pass to the icon component.
   */
  iconProps?: Partial<IconProps>
}

/**
 * A {@link Button} with an icon and a label, which can be displayed in a compact form with a tooltip.
 */
const DecoratedButton = (props: DecoratedButtonProps) => {
  const { label, Glyph, compact, iconProps, ...buttonProps } = props

  const button = (
    <Button {...buttonProps}>
      <Icon size={buttonProps.size} Glyph={Glyph} {...iconProps} />
      {!compact && label}
    </Button>
  )

  return compact ? <Tooltip description={label} anchor={button} /> : button
}

export { DecoratedButton, type DecoratedButtonProps }
