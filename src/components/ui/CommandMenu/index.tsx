import * as Ariakit from '@ariakit/react'
import type { ReactNode } from 'react'

import { type DialogKey, hideDialog } from '@context/dialogs'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { cn } from '@utils/styles'
import type { PickPartial } from '@utils/types'

interface CommandMenuProps extends PickPartial<DialogProps, 'dialogKey'> {
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

  return (
    <Dialog
      showClose={false}
      {...dialogProps}
      onClose={(e) => {
        dialogProps.onClose?.(e)
        submitValue(undefined)
      }}
    >
      <Ariakit.ComboboxProvider
        includesBaseElement={false}
        setValue={onSearchChange}
      >
        <Ariakit.Combobox
          placeholder="Search..."
          className={cn('w-full px-2 py-3 rounded-sm', 'text-sm bg-dark-500')}
          autoSelect
        />

        <Ariakit.ComboboxList
          className={cn('max-h-80 overflow-y-auto')}
          alwaysVisible
        >
          {items === undefined ? (
            <div
              className={cn('text-center p-2', 'text-sm italic text-light-950')}
            >
              Loading
            </div>
          ) : items.length === 0 ? (
            <div
              className={cn('text-center p-2', 'text-sm italic text-light-950')}
            >
              No matches found
            </div>
          ) : (
            items.map((item) => (
              <CommandMenuItem
                key={item.value}
                value={item.value}
                submitValue={submitValue}
                dialogKey={dialogProps.dialogKey}
              />
            ))
          )}
        </Ariakit.ComboboxList>
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
        'text-sm text-center text-light-50',
        'p-2 rounded-sm cursor-pointer',
        'data-[active-item]:bg-dark-100',
      )}
    >
      <Ariakit.ComboboxItemValue
        className={cn(
          ' tracking-widest',
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
