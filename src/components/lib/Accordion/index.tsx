import * as Ariakit from '@ariakit/react'
import { Icon } from '@lib/Icon'
import { IconChevronDown } from '@tabler/icons-react'
import clsx from 'clsx'
import { type ComponentProps, type ReactNode, useState } from 'react'

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
    <div
      {...divProps}
      className={clsx(
        'flex flex-col gap-y-4 rounded-xl border-4 border-dark-300 overflow-hidden',
        divProps.className,
      )}
    >
      <Ariakit.CompositeProvider focusLoop>
        <Ariakit.Composite>
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
                <Ariakit.CompositeItem
                  render={
                    <Ariakit.Disclosure
                      {...disclosureProps}
                      className={clsx(
                        'cursor-pointer w-full group',
                        'text-sm text-light-50 text-start',
                        'p-4 bg-dark-300',
                        'flex flex-row justify-between items-center',
                        'hover:bg-dark-200 data-[active-item]:bg-dark-200',
                        'aria-disabled:bg-dark-400/70 aria-disabled:text-light-950',
                        'not-[group-aria-expanded]:not-last-of-type:border-b-1 not-[group-aria-expanded]:not-last-of-type:border-b-dark-400',
                        disclosureProps.className,
                      )}
                    />
                  }
                >
                  {label}
                  <div className={clsx('flex flex-row gap-x-2 items-center')}>
                    {extraInfo}
                    {showArrows && (
                      <Icon
                        Glyph={IconChevronDown}
                        className={clsx(
                          'group-aria-expanded:rotate-180 text-light-200',
                        )}
                      />
                    )}
                  </div>
                </Ariakit.CompositeItem>
                <Ariakit.DisclosureContent
                  unmountOnHide
                  className={clsx('py-4 px-6 bg-dark-500')}
                >
                  {description}
                </Ariakit.DisclosureContent>
              </Ariakit.DisclosureProvider>
            )
          })}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </div>
  )
}

export { Accordion, type AccordionProps }
