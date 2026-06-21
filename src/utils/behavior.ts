import { useEffect, useRef } from 'react'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { open } from '@tauri-apps/plugin-dialog'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { useEffectOnce } from 'react-use'

import { useQueryAvailableUpdate } from '@/api/queries/availableUpdate'
import { newUpdateAvailableToast } from '@/common/Toasts/NewUpdateAvailable'
import { toast } from '@/lib/Toasts/Toast'
import { getSettings } from '@/state/storage'

/**
 * Prompts the user to select a directory using the native file picker.
 *
 * @returns A promise that resolves when a directory is selected.
 */
export const chooseDirectory = () => {
  return open({
    multiple: false,
    directory: true,
  })
}

/**
 * Opens the given file using the specified application, or the default for its type.
 *
 * @param path - The path to the file to open.
 * @returns A promise that resolves when the file is opened.
 */
export const openFile = (path: string, openWith: string) => {
  return openPath(path, openWith)
}

/**
 * Opens the given url in the default web browser.
 *
 * @param url - The URL to open.
 * @returns A promise that resolves when the URL is opened.
 */
export const openLink = (url: string) => {
  return openUrl(url)
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

    window.addEventListener('contextmenu', preventContextMenu)

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu)
    }
  })
}

/**
 * Waits for the query of available updates to load and notifies the user if the option is enabled.
 */
export const useCheckForUpdates = () => {
  const updatesChecked = useRef(false)
  const updateQuery = useQueryAvailableUpdate()

  useEffect(() => {
    if (!updatesChecked.current && updateQuery.data) {
      updatesChecked.current = true
      const settings = getSettings()

      if (settings.checkForUpdates) {
        toast(newUpdateAvailableToast(updateQuery.data))
      }
    }
  }, [updateQuery.data])
}
