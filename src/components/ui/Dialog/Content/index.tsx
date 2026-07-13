import type { ComponentProps, ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

interface DialogContentProps extends ComponentProps<'div'> {
  /**
   * Optional heading to display at the top of the dialog.
   */
  heading?: ReactNode
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
        'overflow-hidden p-6 rounded-lg',
        'bg-dark-500/70 backdrop-blur-lg border border-light-50/12 border-t-light-50/22',
        !!heading && 'pt-4',
      )}
    >
      {heading && (
        <Ariakit.DialogHeading
          className={cn('tracking-wide text-xl text-start mb-6')}
        >
          {heading}
        </Ariakit.DialogHeading>
      )}

      {children}
    </div>
  )
}

export { DialogContent, type DialogContentProps }
