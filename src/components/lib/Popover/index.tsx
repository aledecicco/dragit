import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface PopoverProps {
  anchor: NonNullable<Ariakit.PopoverDisclosureProps['render']>
  description: ReactNode
  placement?: Ariakit.PopoverProviderProps['placement']
}

const Popover = (props: PopoverProps) => {
  const { anchor, description, placement } = props

  return (
    <Ariakit.PopoverProvider placement={placement}>
      <Ariakit.PopoverDisclosure render={anchor} />
      <Ariakit.Popover
        portal
        unmountOnHide
        gutter={12}
        className={clsx('max-w-sm', 'shadow-md bg-dark-900', 'p-4 rounded-md')}
      >
        {description}
        <Ariakit.PopoverArrow className="[&>svg]:fill-dark-900" />
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  )
}

export { Popover, type PopoverProps }
