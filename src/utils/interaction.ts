import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { openPath } from '@tauri-apps/plugin-opener'
import { useEffectOnce } from 'react-use'

// TODO: make app configurable
const DEFAULT_APP = 'code'

/**
 * Opens the given file using the specified application, or the default for its type.
 *
 * @param path - The path to the file to open.
 * @returns A promise that resolves when the file is opened.
 */
export const openFile = (path: string, openWith: string = DEFAULT_APP) => {
  return openPath(path, openWith)
}

/**
 * Copies the given text to the clipboard, with an optional label that describes it.
 *
 * @param text - The content to copy.
 * @param label - The label that describes it.
 *
 * @returns A promise that indicates the success of the copy operation.
 */
export const copyToClipboard = (text: string, label?: string) => {
  return writeText(text, { label })
}

/**
 * A hook that prevents default browser behaviors for some events.
 */
export const useDefaultEventPrevention = () => {
  useEffectOnce(() => {
    const preventContextMenu = (e: PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const preventSelectAll = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'A') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
      }
    }

    window.addEventListener('contextmenu', preventContextMenu)
    window.addEventListener('keydown', preventSelectAll)

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu)
      window.removeEventListener('keydown', preventSelectAll)
    }
  })
}
