import {
  IconBracketsContainEnd,
  IconBracketsContainStart,
  IconColumns3Filled,
} from '@tabler/icons-react'

import {
  ToggleGroup,
  type ToggleGroupProps,
  useToggleHandler,
} from '@/ui/ToggleGroup'
import { ToggleGroupItem } from '@/ui/ToggleGroup/Item'
import { cn } from '@/utils/styles'

import { DIFF_FILTERS } from '../utils'

interface DiffFilterSelectorProps extends ToggleGroupProps {}

/**
 * A selector for filtering diff views.
 */
const DiffFilterSelector = (props: DiffFilterSelectorProps) => {
  const { ...toggleGroupProps } = props

  return (
    <ToggleGroup fixed {...toggleGroupProps}>
      <ToggleGroupItem
        fixed
        size="sm"
        value="theirs"
        label="Before changes"
        Glyph={IconBracketsContainStart}
      />

      <ToggleGroupItem
        fixed
        size="sm"
        value="both"
        label="Inline changes"
        Glyph={IconColumns3Filled}
        iconProps={{
          className: cn('-rotate-90'),
        }}
      />

      <ToggleGroupItem
        fixed
        size="sm"
        value="ours"
        label="After changes"
        Glyph={IconBracketsContainEnd}
      />
    </ToggleGroup>
  )
}

// TODO: persist toggle selection
const useDiffFilterSelector = () => useToggleHandler(DIFF_FILTERS, 'both')

export {
  DiffFilterSelector,
  useDiffFilterSelector,
  type DiffFilterSelectorProps,
}
