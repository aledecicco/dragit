import { type ReactNode, startTransition } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'

import { Button, type ButtonProps } from '@/ui/Button'
import { Marquee } from '@/ui/Marquee'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'

import { type Glyph, Icon, type IconProps } from '../Icon'
import { Tabs, useTabsHandler } from '../Tabs'
import { Tab } from '../Tabs/Item'
import {
  ComboboxContextProvider,
  useComboboxState,
  useComboboxUpdater,
} from './context'

interface ComboboxProps extends Partial<ButtonProps> {
  /**
   * The currently selected value.
   */
  value: string | undefined

  /**
   * Placeholder text to display when no option is selected.
   */
  placeholder?: string

  /**
   * A decorator for the input.
   */
  Glyph?: Glyph

  /**
   * Additional props to pass to the decorator icon.
   */
  iconProps?: Partial<IconProps>
}

/**
 * A select field that allows searching through a list of options.
 *
 * Automatically filters options based on the current input value.
 */
const Combobox = (props: ComboboxProps): ReactNode => {
  return (
    <ComboboxContextProvider>
      <ComboboxInner {...props} />
    </ComboboxContextProvider>
  )
}

const ComboboxInner = (props: ComboboxProps) => {
  const {
    children,
    value,
    placeholder = 'Select...',
    Glyph,
    iconProps,
    ...buttonProps
  } = props

  const { group, groups } = useComboboxState()
  const { setSearch, setCurrentGroup } = useComboboxUpdater()

  const combobox = Ariakit.useComboboxStore({
    resetValueOnHide: true,
    setValue: (newValue) => {
      startTransition(() => {
        setSearch(newValue)
      })
    },
  })

  const tabsHandler = useTabsHandler(group?.name, {
    selectedId: group?.name,
    setSelectedId: (id) => {
      const selectedGroup = groups.find((g) => g.name === id)
      setCurrentGroup(selectedGroup?.name)
    },
    selectOnMove: true,
    combobox,
  })

  return (
    <Ariakit.ComboboxProvider store={combobox}>
      <Ariakit.SelectProvider
        includesBaseElement={false}
        value={value ?? ''}
        setValue={(newValue) => {
          group?.onSelect(newValue)
        }}
        combobox={combobox}
      >
        <Ariakit.Select
          render={
            <Button
              variant="plain"
              status="neutral"
              size="lg"
              {...propsWithCn(
                buttonProps,
                'min-w-0 group/combobox gap-2 text-sm',
                !value && 'font-thin text-light-300',
              )}
            />
          }
        >
          {Glyph && (
            <Icon Glyph={Glyph} size={buttonProps.size} {...iconProps} />
          )}
          <Marquee reverse={false}>{value ? value : placeholder}</Marquee>
          <Icon
            Glyph={IconChevronDown}
            size={buttonProps.size}
            className={cn('group-aria-expanded/combobox:rotate-180')}
          />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          portal
          sameWidth
          unmountOnHide
          gutter={4}
          className={cn('rounded-lg shadow-md min-w-50', 'bg-dark-300 p-2')}
        >
          <Tabs
            store={tabsHandler.store}
            list={
              groups.length > 1 &&
              groups.map((group) => (
                <Tab
                  key={group.name}
                  id={group.name}
                  className={cn('capitalize')}
                >
                  {group.name}
                </Tab>
              ))
            }
          >
            <Ariakit.Combobox
              placeholder={group ? `Search ${group.name}...` : 'Search...'}
              autoSelect="always"
              className={cn('w-full p-2 rounded-sm', 'text-sm bg-dark-500')}
            />

            <Separator className={cn('my-2')} />

            {children}
          </Tabs>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  )
}

export { Combobox, type ComboboxProps }
