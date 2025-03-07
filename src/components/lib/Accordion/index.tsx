import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'
import clsx from 'clsx'
import { type ComponentProps, type ReactNode, useState } from 'react'

import { Icon } from '@lib/Icon'

interface AccordionSection extends Ariakit.DisclosureProps {
  id: string
  label: ReactNode
  extraInfo?: ReactNode
  description: ReactNode
  defaultOpen?: Ariakit.DisclosureProviderProps['defaultOpen']
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
            className={clsx(
              'flex flex-col bg-dark-500 overflow-hidden',
              divProps.className,
            )}
          />
        }
      >
        {sections.map((section) => {
          const {
            id,
            label,
            extraInfo,
            description,
            defaultOpen,
            ...disclosureProps
          } = section

          return (
            <Ariakit.DisclosureProvider
              key={id}
              defaultOpen={defaultOpen}
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
                      {...disclosureProps}
                      className={clsx(
                        'cursor-pointer w-full group',
                        'text-sm text-light-900 text-start',
                        'p-2 flex flex-row gap-x-2 items-center',
                        'hover:text-light-700 hover:underline',
                        'aria-disabled:text-light-950',
                        disclosureProps.className,
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
                className={clsx(
                  'w-full overflow-y-auto grow',
                  'bg-dark-600 rounded-sm py-2 px-6',
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
