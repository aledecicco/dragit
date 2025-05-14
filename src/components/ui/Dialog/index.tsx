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
        unmountOnHide
        backdrop={<div className={cn('bg-black/50', 'backdrop-blur-md')} />}
        {...propsWithCn(
          dialogProps,
          'fixed top-half left-half -translate-half',
          'w-150 max-w-[70%] max-h-[70%] overflow-auto',
          'p-8 bg-dark-600 rounded-lg',
          'border-2 border-solid border-dark-900',
          'flex flex-col',
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
                size="lg"
                className={cn('text-xl text-light-900 absolute top-1 left-1')}
              />
            }
          />
        )}

        {heading && (
          <Ariakit.DialogHeading
            className={cn('text-2xl font-bold text-center -mt-4 mb-4')}
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
