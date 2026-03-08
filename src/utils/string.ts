import * as Path from '@tauri-apps/api/path'

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

/**
 * Splits a file path into its segments using the appropriate separator.
 *
 * @param filepath - The file path to split.
 */
export const splitPath = (filepath: string): string[] => {
  return filepath.split(Path.sep())
}

/**
 * Gets the directory and filename of a file path.
 *
 * @param filepath - The file path to get the location of.
 *
 * @returns An object containing:
 * - `filedir`: The directory that contains the file.
 * - `filename`: The name of the file.
 */
export const getPathLocation = (filepath: string) => {
  const segments = splitPath(filepath)

  const filename = segments.pop() ?? filepath
  const filedir = `.${Path.sep()}${segments.join(Path.sep())}`

  return { filedir, filename }
}
