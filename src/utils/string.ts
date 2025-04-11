import { writeText } from '@tauri-apps/plugin-clipboard-manager'

export const copyToClipboard = (text: string, label?: string) => {
  return writeText(text, { label })
}

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
