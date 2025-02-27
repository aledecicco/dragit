import {
  IconCloudDownload,
  IconDownload,
  IconUpload,
} from '@tabler/icons-react'
import clsx from 'clsx'

import { Toolbar, type ToolbarTool } from '@lib/Toolbar'

interface BranchToolbarProps {
  isBase: boolean
}

const tools: ToolbarTool[] = [
  {
    Glyph: IconDownload,
    label: 'Pull',
    action: () => {},
  },
  {
    Glyph: IconCloudDownload,
    label: 'Fetch',
    action: () => {},
  },
  {
    Glyph: IconUpload,
    label: 'Push',
    action: () => {},
  },
]

const BranchToolbar = (props: BranchToolbarProps) => {
  const { isBase } = props

  return <Toolbar tools={tools} className={clsx('w-65')} />
}

export { BranchToolbar, type BranchToolbarProps }
