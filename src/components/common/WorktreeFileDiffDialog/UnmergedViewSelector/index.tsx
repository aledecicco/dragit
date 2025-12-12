import { IconColumns3Filled } from '@tabler/icons-react'

import {
  ToggleGroup,
  type ToggleGroupProps,
  useToggleHandler,
} from '@/ui/ToggleGroup'
import { ToggleGroupItem } from '@/ui/ToggleGroup/Item'
import { cn } from '@/utils/styles'

interface UnmergedViewSelectorProps extends ToggleGroupProps {}

const DIFF_VIEW_MODES = ['inline', 'side_by_side'] as const

const UnmergedViewSelector = (props: UnmergedViewSelectorProps) => {
  const { ...toggleGroupProps } = props

  return (
    <ToggleGroup {...toggleGroupProps}>
      <ToggleGroupItem
        value="side_by_side"
        label="View side by side"
        Glyph={IconColumns3Filled}
        compact
      />

      <ToggleGroupItem
        value="inline"
        label="View conflicted version"
        Glyph={IconColumns3Filled}
        iconProps={{ className: cn('rotate-90') }}
        compact
      />
    </ToggleGroup>
  )
}

const useViewModeSelector = () => useToggleHandler(DIFF_VIEW_MODES, 'inline')

export {
  UnmergedViewSelector,
  useViewModeSelector,
  type UnmergedViewSelectorProps,
}
