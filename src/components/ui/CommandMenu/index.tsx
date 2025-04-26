import * as Ariakit from '@ariakit/react'
import { useCallback, useMemo } from 'react'

import { type Shortcut, ShortcutCheatsheet } from '@lib/ShortcutsCheatsheet'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { Separator } from '@ui/Separator'
import { cn, propsWithCn } from '@utils/styles'
import { type PickPartial, mapFn } from '@utils/types'
import { CommandMenuItem } from './Item'

interface CommandMenuProps
  extends Omit<PickPartial<DialogProps, 'dialogKey'>, 'heading' | 'showClose'> {
  items: CommandMenuCommand[] | undefined
  extraShortcuts?: Shortcut[]
  onSearchChange: (value: string) => void
  submitValue: (value: string | undefined) => void
}

interface CommandMenuCommand {
  value: string
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { keys: [{ symbol: '↵', keyName: 'Enter' }], label: 'Select' },
  { keys: [{ symbol: 'Esc', keyName: 'Escape' }], label: 'Cancel' },
  {
    keys: [
      { symbol: '▲', keyName: 'ArrowUp' },
      { symbol: '◄', keyName: 'ArrowLeft' },
      { symbol: '▼', keyName: 'ArrowDown' },
      { symbol: '►', keyName: 'ArrowRight' },
    ],
    label: 'Navigate',
  },
]

const CommandMenu = (props: CommandMenuProps) => {
  const {
    items,
    extraShortcuts = [],
    onSearchChange,
    submitValue,
    ...dialogProps
  } = props

  const shortcuts = useMemo(() => {
    return [...extraShortcuts, ...DEFAULT_SHORTCUTS]
  }, [extraShortcuts])

  const virtualizerOptions = useMemo(() => {
    return mapFn(items, (items) => ({
      getItemKey: (index: number) => items[index].value,
      gap: 0,
      paddingStart: 4,
      paddingEnd: 12,
    }))
  }, [items])

  const Item = useCallback(
    (props: { item: CommandMenuCommand }) => {
      return (
        <CommandMenuItem
          value={props.item.value}
          submitValue={submitValue}
          dialogKey={dialogProps.dialogKey}
        />
      )
    },
    [submitValue, dialogProps.dialogKey],
  )

  return (
    <Dialog
      {...propsWithCn(dialogProps, 'p-0 rounded-md bg-dark-300')}
      showClose={false}
      heading={undefined}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        submitValue(undefined)
      }}
    >
      <Ariakit.ComboboxProvider
        includesBaseElement={false}
        setValue={onSearchChange}
        resetValueOnHide
      >
        <Ariakit.Combobox
          placeholder="Search..."
          className={cn('w-full px-2 py-3 rounded-none', 'text-sm bg-dark-500')}
          autoSelect
        />

        <Separator className={cn('border-dark-700')} />

        <div className={cn('pt-1')}>
          {items === undefined ? (
            <div
              className={cn('p-2 text-center', 'text-sm italic text-light-950')}
            >
              Loading
            </div>
          ) : items.length === 0 ? (
            <div
              className={cn('p-2 text-center', 'text-sm italic text-light-950')}
            >
              No matches found
            </div>
          ) : (
            <Ariakit.ComboboxList
              alwaysVisible
              className={cn('h-80 min-h-0')}
              render={
                <VirtualizedDiv
                  size="sm"
                  items={items}
                  itemSize={36}
                  RenderItem={Item}
                  options={virtualizerOptions}
                />
              }
            />
          )}
        </div>
      </Ariakit.ComboboxProvider>

      <Separator className={cn('w-[95%] border-light-950/10 mb-1')} />
      <ShortcutCheatsheet
        shortcuts={shortcuts}
        className={cn('p-1 self-center')}
      />
    </Dialog>
  )
}

export { CommandMenu, type CommandMenuProps }
