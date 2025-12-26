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
    <ToggleGroup {...toggleGroupProps}>
      <ToggleGroupItem
        value="theirs"
        label="View before changes"
        Glyph={IconBracketsContainStart}
        compact
      />

      <ToggleGroupItem
        value="both"
        label="View changes inline"
        Glyph={IconColumns3Filled}
        iconProps={{
          className: cn('-rotate-90'),
        }}
        compact
      />

      <ToggleGroupItem
        value="ours"
        label="View after changes"
        Glyph={IconBracketsContainEnd}
        compact
      />
    </ToggleGroup>
  )
}

const useDiffFilterSelector = () => useToggleHandler(DIFF_FILTERS, 'both')

export {
  DiffFilterSelector,
  useDiffFilterSelector,
  type DiffFilterSelectorProps,
}
