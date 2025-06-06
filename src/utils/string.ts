import { writeText } from '@tauri-apps/plugin-clipboard-manager'

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
 * Given a word and a count, returns the pluralized form of the word if gramatically correct.
 *
 * @param singular - The word to pluralize.
 * @param count - The count to determine if the singular or plural form should be used.
 * @param include - Whether to include the count in the returned string.
 * @param plural - An optional plural form of the word. Defaults to adding an 's' to the singular form.
 */
export const pluralize = (
  singular: string,
  count: number,
  include?: boolean,
  plural?: string,
) => {
  const suffix = count === 1 ? singular : (plural ?? `${singular}s`)

  if (include) {
    return `${count} ${suffix}`
  }

  return suffix
}
