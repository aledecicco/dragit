import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'

import { Icon } from '@lib/Icon'
import { Separator } from '@lib/Separator'
import { IconInfoCircle } from '@tabler/icons-react'

interface HovercardProps extends Ariakit.HovercardProps {
  anchor: NonNullable<Ariakit.HovercardAnchorProps['render']>
  description: NonNullable<Ariakit.HovercardDescriptionProps['render']>
  heading?: Ariakit.HovercardHeadingProps['render']
  placement?: Ariakit.HovercardProviderProps['placement']
}

const Hovercard = (props: HovercardProps) => {
  const { anchor, heading, description, placement, ...hovercardProps } = props

  return (
    <Ariakit.HovercardProvider placement={placement} timeout={250}>
      <Ariakit.HovercardAnchor render={anchor} />
      <Ariakit.Hovercard
        portal
        unmountOnHide
        gutter={16}
        {...hovercardProps}
        className={clsx(
          'max-w-sm',
          'shadow-md bg-dark-900',
          'p-3 rounded-md',
          hovercardProps.className,
        )}
      >
        <div className={clsx('flex flex-col gap-2')}>
          {heading && (
            <>
              <Ariakit.HovercardHeading
                className={clsx('text-light-200 text-sm')}
                render={heading}
              />
              <Separator />
            </>
          )}

          <Ariakit.HovercardDescription render={description} />
        </div>
        <Ariakit.HovercardArrow className="[&>svg]:fill-dark-900" size={20} />
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  )
}

const HovercardDisclosure = () => {
  return (
    <Ariakit.HovercardDisclosure>
      <Icon Glyph={IconInfoCircle} size="md" className="text-light-500" />
    </Ariakit.HovercardDisclosure>
  )
}

export { Hovercard, HovercardDisclosure, type HovercardProps }
