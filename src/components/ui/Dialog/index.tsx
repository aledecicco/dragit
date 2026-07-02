import { useState } from 'react'
import * as Ariakit from '@ariakit/react'
import * as Dnd from '@dnd-kit/react'
import { IconHandMove, IconX } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  type Draggable,
  useCurrentDrag,
  useDraggable,
} from '@/lib/DragAndDrop/utils'
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

  const [posDelta, setPosDelta] = useState({ x: 0, y: 0 })

  const { ref: dragRef, handleRef } = useDraggable({
    modifiers: [],
    id: dialogKey,
    type: 'dialog',
    data: {
      label: 'dialog',
      Glyph: IconHandMove,
      type: 'dialog',
      dragged: { dialogKey },
    },
  })

  Dnd.useDragDropMonitor({
    onDragEnd: (event) => {
      if (event.canceled) {
        return
      }

      const source = event.operation.source as Draggable | null

      if (
        source?.data.type === 'dialog' &&
        source.data.dragged.dialogKey === dialogKey
      ) {
        setPosDelta((pos) => ({
          x: pos.x + event.operation.transform.x,
          y: pos.y + event.operation.transform.y,
        }))
      }
    },
  })

  return (
    <Ariakit.Dialog
      open
      portal={false}
      backdrop={<div className={cn('bg-black/50')} />}
      getPersistentElements={() =>
        document.querySelectorAll('[data-toasts-root]')
      }
      {...propsWithCn(
        dialogProps,
        'z-7 group/dialog',
        'fixed top-half left-half -translate-half',
        'max-w-[70%] max-h-[70%] rounded-lg overflow-hidden',
        'border-2 border-dark-900 bg-dark-900',
        'grid grid-rows-1 grid-cols-[530px]',
      )}
      style={{
        transform: `translate(${posDelta.x}px, ${posDelta.y}px)`,
        ...dialogProps.style,
      }}
      ref={mergeRefs([dragRef, dialogProps.ref])}
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

      <Ariakit.Focusable
        ref={handleRef}
        className={cn(
          'absolute w-full h-2.5 cursor-pointer group-hover/dialog:bg-dark-900/20',
          'hover:bg-dark-900/30 focus:bg-dark-900/30',
        )}
      />
    </Ariakit.Dialog>
  )
}

export { Dialog, type DialogProps }
