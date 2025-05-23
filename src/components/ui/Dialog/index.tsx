import * as Ariakit from '@ariakit/react'
import type { ComponentProps, ReactNode } from 'react'

import { type DialogKey, hideDialog } from '@context/dialogs'
import { Button } from '@ui/Button'
import { cn, propsWithCn } from '@utils/styles'

interface DialogProps extends Ariakit.DialogProps {
  dialogKey: DialogKey
  heading?: string
  showClose?: boolean
  contentProps?: ComponentProps<'div'>
  sideContent?: ReactNode
}

const Dialog = (props: DialogProps) => {
  const {
    dialogKey,
    heading,
    showClose = true,
    contentProps,
    sideContent,
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
          'max-w-[70%] max-h-[70%] rounded-lg overflow-hidden',
          'border-2 border-solid border-dark-900',
          !!sideContent && 'grid grid-cols-[1fr_2fr]',
        )}
        onClose={(e) => {
          dialogProps.onClose?.(e)
          hideDialog(dialogKey)
        }}
      >
        <div
          {...propsWithCn(
            contentProps,
            'min-w-110 w-150',
            'py-8 px-6 bg-dark-600',
            'flex flex-col overflow-hidden max-h-full',
            heading && 'pb-6',
          )}
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
                    'absolute top-1.5 right-1.5',
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
        </div>

        {!!sideContent && (
          <div className={cn('w-full h-full bg-dark-900')}>{sideContent}</div>
        )}
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  )
}

export { Dialog, type DialogProps }
