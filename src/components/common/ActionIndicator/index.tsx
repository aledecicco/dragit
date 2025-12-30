import {
  type AnyAction,
  useActionPresenters,
  useActiveAction,
} from '@/context/actions'
import { Icon, type IconProps } from '@/ui/Icon'
import { Tooltip } from '@/ui/Tooltip'
import { propsWithCn } from '@/utils/styles'

interface ActionIndicatorProps extends Partial<IconProps> {
  /**
   * The actions being monitored.
   */
  actions: AnyAction[]
}

/**
 * A minimal indicator that shows if any of the given actions are currently active.
 */
const ActionIndicator = (props: ActionIndicatorProps) => {
  const { actions, ...iconProps } = props

  const action = useActiveAction(actions)

  if (!action) {
    return undefined
  }

  return <ActiveActionIndicator {...iconProps} action={action} />
}

const ActiveActionIndicator = (
  props: Partial<IconProps> & { action: AnyAction },
) => {
  const { action, ...iconProps } = props

  const presenter = useActionPresenters(action)

  return (
    <Tooltip
      instant
      description={presenter.label}
      anchor={
        <Icon
          size="sm"
          Glyph={presenter.Glyph}
          {...propsWithCn(
            iconProps,
            'p-0.5 bg-dark-50 text-light-950 rounded-full',
            presenter.actionStatus === 'running' && 'animate-spin',
          )}
        />
      }
    />
  )
}

export { ActionIndicator, type ActionIndicatorProps }
