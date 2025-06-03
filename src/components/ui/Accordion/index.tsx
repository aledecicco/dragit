import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'

import { propsWithCn } from '@utils/styles'
import { AccordionSection } from './Section'

interface AccordionProps extends ComponentProps<'div'> {}

/**
 * A collapsible accordion component that can contain multiple sections that can be navigated using the keyboard.
 *
 * Should contain {@link AccordionSection} components as children.
 */
const Accordion = (props: AccordionProps) => {
  const { ...divProps } = props

  return (
    <Ariakit.CompositeProvider focusLoop focusShift>
      <Ariakit.Composite
        render={<div {...propsWithCn(divProps, 'flex flex-col bg-dark-600')} />}
      />
    </Ariakit.CompositeProvider>
  )
}

export { Accordion, type AccordionProps }
