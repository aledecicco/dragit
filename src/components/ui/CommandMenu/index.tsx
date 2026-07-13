import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'

import { type Shortcut, ShortcutCheatsheet } from '@/lib/Shortcuts/Cheatsheet'
import {
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'
import type { MakeOptional } from '@/utils/types'

import { CommandMenuItem } from './Item'

interface CommandMenuProps
  extends MakeOptional<
    Omit<
      ValueRequesterDialogProps<{ selected: string }>,
      'heading' | 'showClose' | 'children'
    >,
    'formOptions'
  > {
  /**
   * The children of the command menu, which should be a list of command items.
   */
  children?: Ariakit.ComboboxListProps['render']

  /**
   * A list of keyboard shortcuts to display at the bottom of the command menu.
   */
  shortcuts?: Shortcut[]

  /**
   * A footer to display at the bottom of the command menu, before the shortcuts.
   */
  footer?: ReactNode

  /**
   * Callback that updates the search value.
   *
   * @param value - The new search value.
   */
  onSearchChange?: (value: string) => void

  /**
   * Extra props for the search field.
   */
  fieldProps?: Partial<Ariakit.ComboboxProps>
}

/**
 * Dialog that displays a list of command options that can be searched through. Each one triggers an action when selected.
 *
 * Should contain {@link CommandMenuItem} components as children.
 *
 * Displays a keyboard shortcuts cheatsheet at the bottom.
 */
const CommandMenu = (props: CommandMenuProps) => {
  const {
    children,
    shortcuts,
    footer,
    onSearchChange,
    fieldProps,
    ...dialogProps
  } = props

  return (
    <ValueRequesterDialog
      {...propsWithCn(
        dialogProps,
        'rounded-lg',
        'bg-dark-500/80 backdrop-blur-lg border border-light-50/10 border-t-light-50/20',
      )}
      formOptions={{
        defaultValues: { selected: '' },
        className: cn('gap-0'),
      }}
      showClose={false}
    >
      <Ariakit.ComboboxProvider
        open
        includesBaseElement={false}
        focusLoop={false}
        setValue={onSearchChange}
        setSelectedValue={(value) => {
          const result = typeof value === 'string' ? value : value.at(0)
          dialogProps.submitValue(result ? { selected: result } : undefined)
        }}
        resetValueOnHide
      >
        <Ariakit.Combobox
          placeholder="Search..."
          className={cn('w-full p-3 rounded-none', 'text-sm bg-dark-500/30')}
          autoSelect
          {...fieldProps}
        />

        <Separator className={cn('border-dark-700')} />

        <div className={cn('grid max-h-100')}>
          <Ariakit.ComboboxList
            className={cn('h-full bg-dark-800/30')}
            render={children}
          />
        </div>
      </Ariakit.ComboboxProvider>

      <Separator className={cn('w-[95%] border-dark-50 mb-1 self-center')} />

      {footer}

      {!!shortcuts?.length && (
        <ShortcutCheatsheet
          shortcuts={shortcuts}
          className={cn('p-2 self-center')}
        />
      )}
    </ValueRequesterDialog>
  )
}

export { CommandMenu, type CommandMenuProps }
