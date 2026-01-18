import { type ReactNode, useEffect } from 'react'
import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'

import { TabPanel } from '@/ui/Tabs/Panel'
import { cn, propsWithCn } from '@/utils/styles'

import { useComboboxGroupHandler, useComboboxState } from '../context'
import { ComboboxItem } from '../Item'

interface ComboboxSectionProps
  extends Omit<Ariakit.ComboboxListProps, 'onSelect'> {
  /**
   * The name of the section.
   */
  name: string

  /**
   * All available options.
   */
  options: string[]

  /**
   * Callback that triggers when an option is selected.
   *
   * @param option - The selected option.
   */
  onSelect: (option: string) => void

  /**
   * Callback that renders each option.
   *
   * @param option - The option to render.
   */
  renderOption?: (option: string) => ReactNode

  /**
   * Callback that renders when there are no matching options.
   *
   * @param search - The current search string.
   */
  noMatches?: (search: string) => ReactNode
}

const ComboboxSection = (props: ComboboxSectionProps) => {
  const { name, options, renderOption, onSelect, noMatches, ...listProps } =
    props

  const { registerGroup, unregisterGroup } = useComboboxGroupHandler()

  useEffect(() => {
    registerGroup({ name, onSelect })

    return () => {
      unregisterGroup(name)
    }
  }, [name, onSelect, registerGroup, unregisterGroup])

  const { search, group } = useComboboxState()

  if (group?.name !== name) {
    return undefined
  }

  const matchingOptions = matchSorter(options, search)

  return (
    <TabPanel tabId={name}>
      <Ariakit.ComboboxList
        {...propsWithCn(listProps, 'max-h-80 overflow-y-auto')}
      >
        {options.length === 0 ? (
          <div
            className={cn('text-center p-2', 'text-sm italic text-light-950')}
          >
            No {name} found
          </div>
        ) : matchingOptions.length === 0 ? (
          (noMatches?.(search) ?? (
            <div
              className={cn('text-center p-2', 'text-sm italic text-light-950')}
            >
              No matching {name} found
            </div>
          ))
        ) : (
          matchingOptions.map((option) => (
            <ComboboxItem key={option} value={option}>
              {renderOption ? renderOption(option) : option}
            </ComboboxItem>
          ))
        )}
      </Ariakit.ComboboxList>
    </TabPanel>
  )
}

export { ComboboxSection, type ComboboxSectionProps }
