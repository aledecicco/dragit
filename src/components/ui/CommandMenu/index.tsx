import * as Ariakit from '@ariakit/react'
import { type ReactNode, useCallback, useMemo } from 'react'

import { type DialogKey, hideDialog } from '@context/dialogs'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { Separator } from '@ui/Separator'
import { cn, propsWithCn } from '@utils/styles'
import { type PickPartial, mapFn } from '@utils/types'

interface CommandMenuProps
  extends Omit<PickPartial<DialogProps, 'dialogKey'>, 'heading' | 'showClose'> {
  items: CommandMenuCommand[] | undefined
  shortcuts: CommandMenuShortcut[]
  onSearchChange: (value: string) => void
  submitValue: (value: string | undefined) => void
}

interface CommandMenuCommand {
  value: string
}

interface CommandMenuShortcut {
  label: string
  keys: ReactNode[]
}

const CommandMenu = (props: CommandMenuProps) => {
  const { items, shortcuts, onSearchChange, submitValue, ...dialogProps } =
    props

  const virtualizerOptions = useMemo(() => {
    return mapFn(items, (items) => ({
      getItemKey: (index: number) => items[index].value,
      gap: 0,
      paddingStart: 4,
      paddingEnd: 4,
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

        <div className={cn('py-1')}>
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
    </Dialog>
  )
}

interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {
  value: string
  submitValue: (value: string | undefined) => void
  dialogKey: DialogKey
}

const CommandMenuItem = (props: CommandMenuItemProps) => {
  const { value, submitValue, dialogKey } = props
  const context = Ariakit.useComboboxContext()
  const search = Ariakit.useStoreState(context)?.value

  return (
    <Ariakit.ComboboxItem
      onClick={(e) => {
        if (e.ctrlKey) {
          submitValue(search)
        } else {
          submitValue(value)
        }
        hideDialog(dialogKey)
      }}
      focusOnHover
      value={value}
      className={cn(
        'text-xs text-center text-light-500',
        'px-2 py-3 rounded-none cursor-pointer',
        'data-[active-item]:bg-dark-100',
      )}
    >
      <Ariakit.ComboboxItemValue
        className={cn(
          'tracking-wider',
          '[&>[data-autocomplete-value]]:font-thin [&>[data-autocomplete-value]]:text-light-300',
          '[&>[data-user-value]]:font-bold [&>[data-user-value]]:text-light-50',
        )}
      />
    </Ariakit.ComboboxItem>
  )
}

export {
  CommandMenu,
  type CommandMenuProps,
  type CommandMenuItemProps,
  type CommandMenuShortcut,
}
