import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

interface DialogContentProps extends ComponentProps<'div'> {
  heading?: string
}

/**
 * Standardized wrapper for the content of a dialog.
 */
const DialogContent = (props: DialogContentProps) => {
  const { heading, children, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'py-8 px-6 bg-dark-600',
        'overflow-hidden',
        heading && 'pb-6',
      )}
    >
      {heading && (
        <Ariakit.DialogHeading
          className={cn('text-xl font-semibold text-center -mt-2 mb-6')}
        >
          {heading}
        </Ariakit.DialogHeading>
      )}

      {children}
    </div>
  )
}

export { DialogContent, type DialogContentProps }
