import * as Ariakit from '@ariakit/react'

import { type DialogKey, hideDialog } from '@context/dialogs'
import { Button } from '@ui/Button'
import { cn, propsWithCn } from '@utils/styles'

interface DialogProps extends Ariakit.DialogProps {
  dialogKey: DialogKey
  heading?: string
}

const Dialog = (props: DialogProps) => {
  const { dialogKey, heading, children, ...dialogProps } = props

  return (
    <Ariakit.DialogProvider defaultOpen>
      <Ariakit.Dialog
        modal
        unmountOnHide
        backdrop={<div className={cn('bg-black/50 backdrop-blur-md')} />}
        {...propsWithCn(
          dialogProps,
          'fixed z-50 top-half left-half -translate-half',
          'bg-dark-600 rounded-lg',
          'w-150 max-w-full max-h-full overflow-auto',
          'border-4 border-solid border-dark-700',
          'flex flex-col',
        )}
        onClose={(e) => {
          dialogProps.onClose?.(e)
          hideDialog(dialogKey)
        }}
      >
        <div className={cn('relative w-full h-full p-8')}>
          <Ariakit.DialogDismiss
            render={
              <Button
                round
                variant="plain"
                size="lg"
                className={cn(
                  'absolute top-1 right-1',
                  'text-xl text-light-900',
                )}
              />
            }
          />

          {heading && (
            <Ariakit.DialogHeading
              className={cn('text-2xl font-bold text-center -mt-4 mb-4')}
            >
              {heading}
            </Ariakit.DialogHeading>
          )}

          {children}
        </div>
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  )
}

export { Dialog, type DialogProps }
