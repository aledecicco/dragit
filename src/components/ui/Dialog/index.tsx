import * as Ariakit from '@ariakit/react'
import { IconX } from '@tabler/icons-react'

import { DecoratedButton } from '@/lib/DecoratedButton'
import { useCurrentDrag } from '@/lib/DragAndDrop/utils'
import { type DialogKey, hideDialog } from '@/state/dialogs'
import { cn, propsWithCn } from '@/utils/styles'

interface DialogProps extends Ariakit.DialogProps {
  /**
   * The unique identifier of the dialog, used to manage its visibility.
   */
  dialogKey: DialogKey

  /**
   * Whether to display a close button.
   */
  showClose?: boolean
}

/**
 * A dialog component that can be used to display content in an overlay.
 */
const Dialog = (props: DialogProps) => {
  const { dialogKey, showClose = true, children, ...dialogProps } = props

  const isDragging = !!useCurrentDrag()

  return (
    <Ariakit.Dialog
      open
      portal={false}
      backdrop={<div className={cn('bg-black/50')} />}
      {...propsWithCn(
        dialogProps,
        'z-7',
        'fixed top-half left-half -translate-half',
        'max-w-[70%] max-h-[70%] rounded-lg overflow-hidden',
        'border-2 border-dark-900 bg-dark-900',
        'grid grid-rows-1 grid-cols-[530px]',
      )}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        if (!isDragging) {
          hideDialog(dialogKey)
        }
      }}
    >
      {children}

      {showClose && (
        <DecoratedButton
          render={<Ariakit.DialogDismiss />}
          round
          compact
          variant="plain"
          status="neutral"
          size="lg"
          className={cn('text-lg text-light-950', 'absolute top-1.5 right-1.5')}
          label="Close dialog"
          Glyph={IconX}
        />
      )}
    </Ariakit.Dialog>
  )
}

export { Dialog, type DialogProps }
