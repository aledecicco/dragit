import {
  IconBracketsContainEnd,
  IconBracketsContainStart,
  IconColumns3Filled,
} from '@tabler/icons-react'

import { useSettings } from '@/state/settings'
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
        size="sm"
        value="theirs"
        label="Before changes"
        Glyph={IconBracketsContainStart}
        className={cn('relative rounded-bl-none')}
      >
        <div
          className={cn('absolute -left-2 bottom-0 bg-inherit w-2 h-2.5')}
          style={{
            clipPath: 'path("M 0 10 C 6 7.5 6 7.5 8 0 L 8 10 Z")',
          }}
        />
      </ToggleGroupItem>
      <ToggleGroupItem
        size="sm"
        value="both"
        label="Inline changes"
        Glyph={IconColumns3Filled}
        iconProps={{
          className: cn('-rotate-90'),
        }}
      />
      <ToggleGroupItem
        size="sm"
        value="ours"
        label="After changes"
        Glyph={IconBracketsContainEnd}
        className={cn('relative rounded-br-none')}
      >
        <div
          className={cn('absolute -right-2 bottom-0 bg-inherit w-2 h-2.5')}
          style={{
            clipPath: 'path("M 8 10 C 2 7.5 2 7.5 0 0 L 0 10 Z")',
          }}
        />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const useDiffFilterSelector = () => {
  const { preferInline } = useSettings()
  const defaultValue = preferInline ? 'both' : 'ours'

  return useToggleHandler(DIFF_FILTERS, defaultValue)
}

export {
  DiffFilterSelector,
  useDiffFilterSelector,
  type DiffFilterSelectorProps,
}
