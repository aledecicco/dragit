import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'

import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

import { Accordion } from '..'

interface AccordionSectionProps extends Ariakit.DisclosureContentProps {
  /**
   * The label for the section, displayed in the header.
   */
  label: string

  /**
   * Extra information to be displayed at the end of the header.
   */
  extraInfo?: ReactNode

  /**
   * Whether this section should be open by default.
   */
  defaultOpen?: boolean
}

/**
 * A single section inside an {@link Accordion}.
 */
const AccordionSection = (props: AccordionSectionProps) => {
  const { label, extraInfo, defaultOpen, ...contentProps } = props

  return (
    <Ariakit.DisclosureProvider defaultOpen={defaultOpen}>
      <Ariakit.CompositeRow
        render={<div className={cn('flex flex-row items-center gap-x-2')} />}
      >
        <Ariakit.CompositeItem
          tabbable
          render={
            <Ariakit.Disclosure
              className={cn(
                'capitalize',
                'cursor-pointer w-full group/accordion',
                'text-sm text-light-600 text-start',
                'py-2 flex flex-row gap-x-2 items-center w-max',
                'hover:underline',
                'focus:underline',
                'data-focus:underline',
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
      </Ariakit.CompositeRow>

      <Ariakit.DisclosureContent
        unmountOnHide
        {...propsWithCn(
          contentProps,
          'overflow-y-hidden grow',
          'w-full bg-dark-800 rounded-sm',
        )}
      />
    </Ariakit.DisclosureProvider>
  )
}

export { AccordionSection, type AccordionSectionProps }
