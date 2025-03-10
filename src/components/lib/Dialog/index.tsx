import * as Ariakit from '@ariakit/react'
import { Button } from '@lib/Button'
import clsx from 'clsx'

interface DialogProps extends Ariakit.DialogProps {
  heading?: string
}

const Dialog = (props: DialogProps) => {
  const { heading, children, ...dialogProps } = props

  return (
    <Ariakit.DialogProvider>
      <Ariakit.Dialog
        modal
        unmountOnHide
        backdrop={<div className={clsx('bg-black/50 backdrop-blur-md')} />}
        {...dialogProps}
        className={clsx(
          'fixed z-50 top-half left-half -translate-half',
          'bg-dark-600 p-8 rounded-lg',
          'w-150 max-w-full max-h-full overflow-auto',
          'border-4 border-solid border-dark-700',
          'flex flex-col',
          dialogProps.className,
        )}
      >
        <Ariakit.DialogDismiss
          render={
            <Button
              round
              variant="plain"
              size="lg"
              className={clsx(
                'self-end translate-x-7 -translate-y-7 text-xl text-light-900',
              )}
            />
          }
        />

        {heading && (
          <Ariakit.DialogHeading
            className={clsx('text-2xl font-bold text-center -mt-4 mb-4')}
          >
            {heading}
          </Ariakit.DialogHeading>
        )}

        {children}
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  )
}

export { Dialog, type DialogProps }
