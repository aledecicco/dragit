import type { ComponentProps, ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconX } from '@tabler/icons-react'

import { DecoratedButton } from '@/lib/DecoratedButton'
import { type DialogKey, hideDialog } from '@/state/dialogs'
import { cn, propsWithCn } from '@/utils/styles'

interface DialogProps extends Ariakit.DialogProps {
  /**
   * The unique identifier of the dialog, used to manage its visibility.
   */
  dialogKey: DialogKey

  /**
   * An optional title to be used as heading.
   */
  heading?: string

  /**
   * Whether to display a close button.
   */
  showClose?: boolean

  /**
   * Additional props for the div that wraps the content.
   */
  contentProps?: ComponentProps<'div'>

  /**
   * Optional content to be displayed to one side of the dialog.
   */
  sideContent?: Ariakit.RoleProps['render']
}

/**
 * A dialog component that can be used to display content in an overlay.
 *
 * It supports a heading, close button, and side content.
 */
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
    <Ariakit.Dialog
      open
      portal={false}
      backdrop={<div className={cn('bg-black/50')} />}
      {...propsWithCn(
        dialogProps,
        'fixed top-half left-half -translate-half',
        'max-w-[70%] max-h-[70%] rounded-lg overflow-hidden',
        'border-2 border-dark-900',
        'grid grid-rows-1',
        sideContent
          ? 'w-full h-full grid-cols-[430px_1fr]'
          : 'grid-cols-[530px]',
      )}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        hideDialog(dialogKey)
      }}
    >
      {(!!children || !!heading) && (
        <div
          {...propsWithCn(
            contentProps,
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
      )}

      {!!sideContent && (
        <Ariakit.Role
          className={cn('w-full h-full bg-dark-900')}
          render={sideContent}
        />
      )}

      {showClose && (
        <DecoratedButton
          render={<Ariakit.DialogDismiss />}
          round
          compact
          variant="plain"
          status="neutral"
          size="md"
          className={cn('text-lg text-light-950', 'absolute top-1.5 right-1.5')}
          label="Close dialog"
          Glyph={IconX}
        />
      )}
    </Ariakit.Dialog>
  )
}

export { Dialog, type DialogProps }
