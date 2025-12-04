import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'

import { type Shortcut, ShortcutCheatsheet } from '@/lib/ShortcutsCheatsheet'
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
      ValueRequesterDialogProps<{ value: string }>,
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
    shortcuts = DEFAULT_SHORTCUTS,
    footer,
    onSearchChange,
    ...dialogProps
  } = props

  return (
    <ValueRequesterDialog
      {...propsWithCn(dialogProps, 'rounded-md')}
      formOptions={{
        defaultValues: { value: '' },
      }}
      showClose={false}
      heading={undefined}
      contentProps={propsWithCn(dialogProps.contentProps, 'p-0 bg-dark-300')}
    >
      <Ariakit.ComboboxProvider
        open
        includesBaseElement={false}
        focusLoop={false}
        setValue={onSearchChange}
        setSelectedValue={(value) => {
          const arg = typeof value === 'string' ? value : value.at(0)
          dialogProps.submitValue(arg ? { value: arg } : undefined)
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
    </ValueRequesterDialog>
  )
}

export { CommandMenu, type CommandMenuProps }
