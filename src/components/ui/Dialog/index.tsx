import * as Ariakit from '@ariakit/react'

import { type DialogKey, hideDialog } from '@context/dialogs'
import { Button } from '@ui/Button'
import { cn, propsWithCn } from '@utils/styles'

interface DialogProps extends Ariakit.DialogProps {
  dialogKey: DialogKey
  heading?: string
  showClose?: boolean
}

const Dialog = (props: DialogProps) => {
  const {
    dialogKey,
    heading,
    showClose = true,
    children,
    ...dialogProps
  } = props

  return (
    <Ariakit.DialogProvider defaultOpen>
      <Ariakit.Dialog
        modal
        portal
        unmountOnHide
        backdrop={<div className={cn('bg-black/50', 'backdrop-blur-md')} />}
        {...propsWithCn(
          dialogProps,
          'fixed top-half left-half -translate-half',
          'w-150 max-w-[70%] max-h-[70%] overflow-auto',
          'py-8 px-6 bg-dark-600 rounded-lg',
          'border-2 border-solid border-dark-900',
          'flex flex-col',
          heading && 'pb-6',
        )}
        onClose={(e) => {
          dialogProps.onClose?.(e)
          hideDialog(dialogKey)
        }}
      >
        {showClose && (
          <Ariakit.DialogDismiss
            render={
              <Button
                round
                variant="plain"
                status="neutral"
                size="md"
                className={cn(
                  'text-lg text-light-950',
                  'absolute top-1.5 left-1.5',
                )}
                description="Close dialog"
              />
            }
          />
        )}

        {heading && (
          <Ariakit.DialogHeading
            className={cn('text-xl font-bold text-center -mt-2 mb-6')}
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
