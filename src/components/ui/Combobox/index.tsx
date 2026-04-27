import { type ReactNode, startTransition } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'
import { match } from 'ts-pattern'

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
  value: string

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
    size = 'md',
    ...buttonProps
  } = props

  const { search, group, groups } = useComboboxState()
  const { setSearch, setCurrentGroup } = useComboboxUpdater()

  const tabsHandler = useTabsHandler(group?.name, {
    selectedId: group?.name,
    setSelectedId: (id) => {
      const selectedGroup = groups.find((g) => g.name === id)
      setCurrentGroup(selectedGroup?.name)
    },
    selectOnMove: true,
  })

  return (
    <Ariakit.ComboboxProvider
      value={search}
      setValue={(newValue) => {
        startTransition(() => {
          setSearch(newValue)
        })
      }}
    >
      <Ariakit.SelectProvider
        includesBaseElement={false}
        value={value}
        setOpen={(open) => {
          if (open) {
            setSearch('')
          }
        }}
        setValue={(newValue) => {
          group?.onSelect(newValue)
        }}
      >
        <Ariakit.Select
          render={
            <Button
              variant="plain"
              status="neutral"
              {...propsWithCn(
                buttonProps,
                'min-w-0 group/combobox gap-2 text-sm',
                !value && 'font-normal text-light-300',
              )}
            />
          }
        >
          {Glyph && <Icon Glyph={Glyph} size={size} {...iconProps} />}
          <Marquee reverse={false}>{value ? value : placeholder}</Marquee>
          <Icon
            Glyph={IconChevronDown}
            size={size}
            className={cn('group-aria-expanded/combobox:rotate-180')}
          />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          portal
          sameWidth
          unmountOnHide
          gutter={4}
          className={cn(
            'shadow-md min-w-50 bg-dark-300',

            match(size)
              .with('xs', () => 'p-1.5 rounded-sm')
              .with('sm', () => 'p-1.5 rounded-md')
              .with('md', () => 'p-2 rounded-lg')
              .with('lg', () => 'p-2.5 rounded-lg')
              .exhaustive(),
          )}
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
                  size={size}
                >
                  {group.name}
                </Tab>
              ))
            }
          >
            <Ariakit.Combobox
              placeholder={group ? `Search ${group.name}...` : 'Search...'}
              autoSelect="always"
              className={cn(
                'w-full bg-dark-500',

                match(size)
                  .with('xs', () => 'p-1.5 rounded-xs text-xs')
                  .with('sm', () => 'p-1.75 rounded-xs text-xs')
                  .with('md', () => 'p-2 rounded-sm text-sm')
                  .with('lg', () => 'p-2.5 rounded-sm text-base')
                  .exhaustive(),
              )}
              onKeyDownCapture={(e) => {
                // Prevent arrow keys from switching tabs when text is being navigated.

                if (e.key === 'ArrowLeft' || e.key === 'Home') {
                  const isAtStart =
                    e.currentTarget.selectionStart === 0 &&
                    e.currentTarget.selectionEnd === 0

                  if (!isAtStart) {
                    e.stopPropagation()
                  }
                }

                if (e.key === 'ArrowRight' || e.key === 'End') {
                  const isAtEnd =
                    e.currentTarget.selectionStart ===
                      e.currentTarget.value.length &&
                    e.currentTarget.selectionEnd ===
                      e.currentTarget.value.length

                  if (!isAtEnd) {
                    e.stopPropagation()
                  }
                }
              }}
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
