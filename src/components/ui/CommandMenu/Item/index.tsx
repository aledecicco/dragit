import * as Ariakit from '@ariakit/react'

import { type DialogKey, hideDialog } from '@context/dialogs'
import { cn } from '@utils/styles'

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

export { CommandMenuItem, type CommandMenuItemProps }
