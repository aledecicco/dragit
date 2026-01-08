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

/**
 * A selector to choose a view mode for unmerged files.
 */
const UnmergedViewSelector = (props: UnmergedViewSelectorProps) => {
  const { ...toggleGroupProps } = props

  return (
    <ToggleGroup fixed {...toggleGroupProps}>
      <ToggleGroupItem
        fixed
        size="sm"
        value="side_by_side"
        label="Side by side"
        Glyph={IconColumns3Filled}
      />

      <ToggleGroupItem
        fixed
        size="sm"
        value="inline"
        label="Inline conflicts"
        Glyph={IconColumns3Filled}
        iconProps={{ className: cn('rotate-90') }}
      />
    </ToggleGroup>
  )
}

// TODO: persist toggle selection
const useViewModeSelector = () => useToggleHandler(DIFF_VIEW_MODES, 'inline')

export {
  UnmergedViewSelector,
  useViewModeSelector,
  type UnmergedViewSelectorProps,
}
