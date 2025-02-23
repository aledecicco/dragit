import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'

import { Separator } from '@lib/Separator'

interface HovercardProps {
  anchor: NonNullable<Ariakit.HovercardAnchorProps['render']>
  heading: NonNullable<Ariakit.HovercardHeadingProps['render']>
  description: NonNullable<Ariakit.HovercardDescriptionProps['render']>
  placement?: Ariakit.HovercardProviderProps['placement']
}

const Hovercard = (props: HovercardProps) => {
  const { anchor, heading, description, placement } = props

  return (
    <Ariakit.HovercardProvider placement={placement} timeout={200}>
      <Ariakit.HovercardAnchor render={anchor} />
      <Ariakit.Hovercard
        portal
        unmountOnHide
        className={clsx('max-w-sm', 'shadow-md bg-dark-900', 'p-3 rounded-md')}
      >
        <div className={clsx('flex flex-col gap-2')}>
          <Ariakit.HovercardHeading
            render={heading}
            className={clsx('text-light-200 text-sm')}
          />

          <Separator />

          <Ariakit.HovercardDescription render={description} />
        </div>
        <Ariakit.HovercardArrow className="[&>svg]:fill-dark-900" />
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  )
}

export { Hovercard, type HovercardProps }
