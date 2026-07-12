import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'

import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

import { Accordion } from '..'

interface AccordionSectionProps extends Ariakit.DisclosureProviderProps {
  /**
   * The label for the section, displayed in the header.
   */
  label: string

  /**
   * Extra information to be displayed at the end of the header.
   */
  extraInfo?: ReactNode

  /**
   * Props to be passed to the content of the section.
   */
  contentProps?: Omit<Ariakit.DisclosureContentProps, 'children'>
}

/**
 * A single section inside an {@link Accordion}.
 */
const AccordionSection = (props: AccordionSectionProps) => {
  const { label, extraInfo, contentProps, children, ...disclosureProps } = props

  return (
    <Ariakit.DisclosureProvider {...disclosureProps}>
      <Ariakit.CompositeRow
        render={<div className={cn('flex flex-row items-center gap-x-2')} />}
      >
        <Ariakit.CompositeItem
          tabbable
          render={
            <Ariakit.Disclosure
              className={cn(
                'uppercase text-2xs font-semibold tracking-widest',
                'cursor-pointer w-full group/accordion',
                'text-light-800 text-start',
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
      >
        {children}
      </Ariakit.DisclosureContent>
    </Ariakit.DisclosureProvider>
  )
}

const useAccordionSectionHandler = (
  storeProps?: Partial<Ariakit.DisclosureStoreProps>,
) => {
  const store = Ariakit.useDisclosureStore({
    ...storeProps,
  })
  const isOpen = Ariakit.useStoreState(store, 'open')

  return { store, isOpen }
}

export {
  AccordionSection,
  useAccordionSectionHandler,
  type AccordionSectionProps,
}
