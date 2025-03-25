import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'

import { propsWithCn } from '@utils/styles'

interface AccordionProps extends ComponentProps<'div'> {}

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
