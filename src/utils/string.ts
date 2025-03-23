import { writeText } from '@tauri-apps/plugin-clipboard-manager'

export const copyToClipboard = (text: string, label?: string) => {
  return writeText(text, { label })
}
