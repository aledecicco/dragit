import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'
import type { ReactNode } from 'react'

import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface AccordionSectionProps extends Ariakit.DisclosureContentProps {
  label: string
  extraInfo?: ReactNode
}

const AccordionSection = (props: AccordionSectionProps) => {
  const { label, extraInfo, ...contentProps } = props

  return (
    <Ariakit.DisclosureProvider defaultOpen>
      <div className={cn('flex flex-row items-center justify-between', 'px-2')}>
        <Ariakit.CompositeItem
          tabbable
          render={
            <Ariakit.Disclosure
              className={cn(
                'cursor-pointer w-full group/accordion',
                'text-sm text-light-600 text-start',
                'p-2 flex flex-row gap-x-2 items-center',
                'hover:text-light-700 hover:underline',
                'focus:text-light-700 focus:underline',
                'data-focus:text-light-700 data-focus:underline',
                'aria-disabled:text-light-950',
              )}
            />
          }
        >
          <Icon
            Glyph={IconChevronDown}
            className={cn('group-aria-expanded/accordion:rotate-180')}
          />
          {label}
        </Ariakit.CompositeItem>

        {extraInfo}
      </div>

      <Ariakit.DisclosureContent
        unmountOnHide
        {...propsWithCn(
          contentProps,
          'overflow-y-auto grow',
          'w-full bg-dark-700 rounded-sm',
        )}
      />
    </Ariakit.DisclosureProvider>
  )
}

export { AccordionSection, type AccordionSectionProps }
