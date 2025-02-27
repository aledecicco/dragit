import {
  IconCloudDownload,
  IconDownload,
  IconUpload,
} from '@tabler/icons-react'

import { Toolbar, type ToolbarTool } from '@lib/Toolbar'

const tools: ToolbarTool[] = [
  {
    Glyph: IconDownload,
    label: 'Pull',
    action: () => {},
    className: '[&]:w-20',
  },
  {
    Glyph: IconCloudDownload,
    label: 'Fetch',
    action: () => {},
    className: '[&]:w-20',
  },
  {
    Glyph: IconUpload,
    label: 'Push',
    action: () => {},
    className: '[&]:w-20',
  },
]

const BranchToolbars = () => {
  return (
    <>
      <Toolbar tools={tools} />
      -
      <Toolbar tools={tools} />
    </>
  )
}

export { BranchToolbars }
