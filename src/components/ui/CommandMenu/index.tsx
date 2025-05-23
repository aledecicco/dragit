import * as Ariakit from '@ariakit/react'
import type { ReactNode } from 'react'

import { hideDialog } from '@context/dialogs'
import { type Shortcut, ShortcutCheatsheet } from '@lib/ShortcutsCheatsheet'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { Separator } from '@ui/Separator'
import { cn, propsWithCn } from '@utils/styles'
import type { PickPartial } from '@utils/types'

interface CommandMenuProps
  extends Omit<
    PickPartial<DialogProps, 'dialogKey'>,
    'heading' | 'showClose' | 'children'
  > {
  children: Ariakit.ComboboxListProps['render']
  shortcuts?: Shortcut[]
  footer?: ReactNode
  onSearchChange: (value: string) => void
  submitValue: (value: string | undefined) => void
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { keys: [{ symbol: '↵', keyName: 'Enter' }], label: 'Select' },
  { keys: [{ symbol: 'Esc', keyName: 'Escape' }], label: 'Cancel' },
  {
    keys: [
      { symbol: '▲', keyName: 'ArrowUp' },
      { symbol: '▼', keyName: 'ArrowDown' },
    ],
    label: 'Navigate',
  },
]

const CommandMenu = (props: CommandMenuProps) => {
  const {
    children,
    shortcuts = DEFAULT_SHORTCUTS,
    footer,
    onSearchChange,
    submitValue,
    ...dialogProps
  } = props

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
        open
        includesBaseElement={false}
        focusLoop={false}
        setValue={onSearchChange}
        setSelectedValue={(value) => {
          submitValue(typeof value === 'string' ? value : value.at(0))
          hideDialog(dialogProps.dialogKey)
        }}
        resetValueOnHide
      >
        <Ariakit.Combobox
          placeholder="Search..."
          className={cn('w-full px-2 py-3 rounded-none', 'text-sm bg-dark-500')}
          autoSelect
        />

        <Separator className={cn('border-dark-700')} />

        <div className={cn('pt-1 grid max-h-70')}>
          <Ariakit.ComboboxList className={cn('h-full')} render={children} />
        </div>
      </Ariakit.ComboboxProvider>

      <Separator
        className={cn('w-[95%] border-light-950/10 mb-1 self-center')}
      />

      {footer}

      {!!shortcuts.length && (
        <ShortcutCheatsheet
          shortcuts={shortcuts}
          className={cn('p-1 self-center')}
        />
      )}
    </Dialog>
  )
}

export { CommandMenu, type CommandMenuProps }
