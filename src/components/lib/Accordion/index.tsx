import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'
import clsx from 'clsx'
import { type ComponentProps, type ReactNode, useState } from 'react'

import { Icon } from '@lib/Icon'

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
        render={
          <div
            {...divProps}
            className={clsx('flex flex-col bg-dark-600', divProps.className)}
          />
        }
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
                className={clsx(
                  'flex flex-row items-center justify-between',
                  'px-2',
                )}
              >
                <Ariakit.CompositeItem
                  tabbable
                  render={
                    <Ariakit.Disclosure
                      className={clsx(
                        'cursor-pointer w-full group',
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
                      className={clsx('group-aria-expanded:rotate-180')}
                    />
                  )}
                  {label}
                </Ariakit.CompositeItem>

                {extraInfo}
              </div>

              <Ariakit.DisclosureContent
                unmountOnHide
                {...contentProps}
                className={clsx(
                  'overflow-y-auto grow',
                  'w-full bg-dark-700 rounded-sm p-2',
                  contentProps.className,
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
