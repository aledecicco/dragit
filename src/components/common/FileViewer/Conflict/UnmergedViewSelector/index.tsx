import {
  IconChevronLeft,
  IconChevronRight,
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

interface UnmergedViewSelectorProps extends ToggleGroupProps {}

const DIFF_VIEW_MODES = ['inline', 'ours', 'theirs'] as const

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
        value="ours"
        label="Our changes"
        Glyph={IconChevronLeft}
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
        fixed
        size="sm"
        value="inline"
        label="Inline conflicts"
        Glyph={IconColumns3Filled}
      />

      <ToggleGroupItem
        fixed
        size="sm"
        value="theirs"
        label="Their changes"
        Glyph={IconChevronRight}
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

const useViewModeSelector = () => {
  const settings = useSettings()
  const defaultValue = settings.preferInline ? 'inline' : 'ours'

  return useToggleHandler(DIFF_VIEW_MODES, defaultValue)
}

export {
  UnmergedViewSelector,
  useViewModeSelector,
  type UnmergedViewSelectorProps,
}
