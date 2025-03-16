import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'
import { type ComponentProps, type ReactNode, useState } from 'react'

import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface AccordionSection extends Ariakit.DisclosureContentProps {
  id: string
  label: ReactNode
  extraInfo?: ReactNode
  description: ReactNode
}

interface AccordionProps extends ComponentProps<'div'> {
  sections: AccordionSection[]
  showArrows?: boolean
  oneAtATime?: boolean
}

const Accordion = (props: AccordionProps) => {
  const { sections, showArrows, oneAtATime, ...divProps } = props
  const [expanded, setExpanded] = useState<string>()

  return (
    <Ariakit.CompositeProvider focusLoop>
      <Ariakit.Composite
        render={<div {...propsWithCn(divProps, 'flex flex-col bg-dark-600')} />}
      >
        {sections.map((section) => {
          const { id, label, extraInfo, description, ...contentProps } = section

          return (
            <Ariakit.DisclosureProvider
              key={id}
              defaultOpen
              {...(oneAtATime && {
                open: expanded === id,
                setOpen: (open) => {
                  if (open) {
                    setExpanded(id)
                  } else {
                    setExpanded(undefined)
                  }
                },
              })}
            >
              <div
                className={cn(
                  'flex flex-row items-center justify-between',
                  'px-2',
                )}
              >
                <Ariakit.CompositeItem
                  tabbable
                  render={
                    <Ariakit.Disclosure
                      className={cn(
                        'cursor-pointer w-full group/accordion',
                        'text-sm text-light-900 text-start',
                        'p-2 flex flex-row gap-x-2 items-center',
                        'hover:text-light-700 hover:underline',
                        'aria-disabled:text-light-950',
                      )}
                    />
                  }
                >
                  {showArrows && (
                    <Icon
                      Glyph={IconChevronDown}
                      className={cn('group-aria-expanded/accordion:rotate-180')}
                    />
                  )}
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
              >
                {description}
              </Ariakit.DisclosureContent>
            </Ariakit.DisclosureProvider>
          )
        })}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  )
}

export { Accordion, type AccordionProps }
