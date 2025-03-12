import * as Ariakit from '@ariakit/react'

import { Icon } from '@lib/Icon'
import { Separator } from '@lib/Separator'
import { IconInfoCircle } from '@tabler/icons-react'
import { cn, propsWithCn } from '@utils/styles'

interface HovercardProps extends Ariakit.HovercardProps {
  anchor: NonNullable<Ariakit.HovercardAnchorProps['render']>
  description: NonNullable<Ariakit.HovercardDescriptionProps['render']>
  heading?: Ariakit.HovercardHeadingProps['render']
  placement?: Ariakit.HovercardProviderProps['placement']
}

const Hovercard = (props: HovercardProps) => {
  const { anchor, heading, description, placement, ...hovercardProps } = props

  return (
    <Ariakit.HovercardProvider placement={placement}>
      <Ariakit.HovercardAnchor render={anchor} />
      <Ariakit.Hovercard
        portal
        unmountOnHide
        gutter={16}
        {...propsWithCn(
          hovercardProps,
          'max-w-sm',
          'shadow-md bg-dark-300',
          'p-3 rounded-md',
        )}
      >
        <div className={cn('flex flex-col gap-2')}>
          {heading && (
            <>
              <Ariakit.HovercardHeading
                className={cn('text-light-200 text-sm')}
                render={heading}
              />
              <Separator />
            </>
          )}

          <Ariakit.HovercardDescription render={description} />
        </div>
        <Ariakit.HovercardArrow className="[&>svg]:fill-dark-300" size={20} />
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  )
}

const HovercardDisclosure = (props: Ariakit.HovercardDisclosureProps) => {
  const { ...hovercardDisclosureProps } = props

  return (
    <Ariakit.HovercardDisclosure
      {...propsWithCn(hovercardDisclosureProps, 'text-light-500')}
    >
      <Icon Glyph={IconInfoCircle} size="md" />
    </Ariakit.HovercardDisclosure>
  )
}

export { Hovercard, HovercardDisclosure, type HovercardProps }
