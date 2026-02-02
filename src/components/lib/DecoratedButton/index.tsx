import { match } from 'ts-pattern'

import { type AnyAction, useActionPresenters } from '@/state/actions'
import { Button, type ButtonProps, type ButtonStatus } from '@/ui/Button'
import { type Glyph, Icon, type IconProps } from '@/ui/Icon'
import { Tooltip } from '@/ui/Tooltip'
import { propsWithCn } from '@/utils/styles'

interface BaseDecoratedButtonProps extends ButtonProps {
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

type DecoratedButtonProps =
  | CommonDecoratedButtonProps
  | TrackerDecoratedButtonProps

interface CommonDecoratedButtonProps extends BaseDecoratedButtonProps {}

interface TrackerDecoratedButtonProps
  extends Omit<BaseDecoratedButtonProps, 'label' | 'Glyph'> {
  /**
   * An action to get the label and icon from.
   */
  track: AnyAction
}

/**
 * A {@link Button} with an icon and a label, which can be displayed in a compact form with a tooltip.
 */
const DecoratedButton = (props: DecoratedButtonProps) => {
  if ('track' in props) {
    return <TrackerDecoratedButton {...props} />
  }

  return <BaseDecoratedButton {...props} />
}

const TrackerDecoratedButton = (props: TrackerDecoratedButtonProps) => {
  const { track, ...buttonProps } = props

  const { label, Glyph, actionStatus } = useActionPresenters(track)
  const buttonStatus = match(actionStatus)
    .returnType<ButtonStatus>()
    .with('idle', () => buttonProps.status ?? 'neutral')
    .with('running', () => buttonProps.status ?? 'neutral')
    .with('success', () => 'success')
    .with('error', () => 'danger')
    .with('disabled', () => buttonProps.status ?? 'neutral')
    .exhaustive()

  return (
    <BaseDecoratedButton
      {...buttonProps}
      label={label}
      Glyph={Glyph}
      status={buttonStatus}
      disabled={buttonProps.disabled || actionStatus === 'disabled'}
      iconProps={propsWithCn(
        buttonProps.iconProps,
        actionStatus === 'running' ? 'animate-spin' : undefined,
      )}
    />
  )
}

const BaseDecoratedButton = (props: BaseDecoratedButtonProps) => {
  const { label, Glyph, compact, iconProps, children, ...buttonProps } = props

  const button = (
    <Button aria-label={label} {...buttonProps}>
      <Icon size={buttonProps.size} Glyph={Glyph} {...iconProps} />
      {!compact && label}
      {children}
    </Button>
  )

  return compact ? <Tooltip description={label} anchor={button} /> : button
}

export { DecoratedButton, type DecoratedButtonProps }
