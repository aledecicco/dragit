import { useEffectOnce } from 'react-use'
import { Toaster, toast } from 'sonner'

export const ESCAPE_HANDLER_KEY = Symbol.for('dragit/ESCAPE_HANDLER')

interface EscapeEvent extends KeyboardEvent {
  [ESCAPE_HANDLER_KEY]?: boolean
}

/**
 * Slot that displays the currently active toasts.
 */
const ToastsHandler = () => {
  useEffectOnce(() => {
    const handleKeyCapture = (e: EscapeEvent) => {
      if (e.key !== 'Escape') {
        return
      }

      e[ESCAPE_HANDLER_KEY] = !!document.activeElement?.closest(
        '[role="dialog"], [role="menu"]',
      )
    }

    const handleKeyDown = (e: EscapeEvent) => {
      if (e.key !== 'Escape') {
        return
      }

      if (e[ESCAPE_HANDLER_KEY]) {
        return
      }

      if (
        document.activeElement?.closest(
          '[role="listbox"][data-has-selection="true"]',
        )
      ) {
        return
      }

      toast.dismiss()
    }

    window.addEventListener('keydown', handleKeyCapture, { capture: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyCapture, { capture: true })
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  return (
    <div data-toasts-root>
      <Toaster position="bottom-center" duration={Number.POSITIVE_INFINITY} />
    </div>
  )
}

export { ToastsHandler }
