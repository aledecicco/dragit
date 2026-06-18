import { Toaster } from 'sonner'

/**
 * Slot that displays the currently active toasts.
 */
const ToastsHandler = () => {
  return <Toaster position="bottom-center" duration={Infinity} />
}

export { ToastsHandler }
