import { useDeferredValue, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'
import { useEffectOnce, usePrevious } from 'react-use'

import { Button, type ButtonProps } from '@/ui/Button'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'

import { EditableTextItem } from './Item'

interface EditableTextProps extends Ariakit.ComboboxProps {
  /**
   * A label used for accessibility.
   */
  label: string

  /**
   * The list of all possible suggestions that could be displayed.
   * If not provided, the suggestions dropdown won't be displayed.
   */
  suggestions?: string[]

  /**
   * The currently submitted value.
   */
  value: string

  /**
   * Callback that is called when the value is committed.
   */
  setValue: (value: string) => void

  /**
   * Props for the button that triggers the editable text.
   */
  buttonProps?: ButtonProps
}

/**
 * A button that turns into an editable text input when clicked.
 *
 * The changes can be committed by pressing Enter, or discarded by pressing Escape.
 */
const EditableText = (props: EditableTextProps) => {
  const {
    label,
    buttonProps,
    suggestions = [],
    value,
    setValue,
    ...comboboxProps
  } = props

  const [editing, setEditing] = useState(false)
  const prevEditing = usePrevious(editing)

  return editing ? (
    <EditableTextInner
      autoFocus
      {...propsWithCn(comboboxProps, 'font-medium')}
      defaultValue={value}
      placeholder={comboboxProps.placeholder ?? `Enter a ${label}...`}
      label={label}
      suggestions={suggestions}
      persistValue={(value) => {
        setValue(value)
        setEditing(false)
      }}
      discardValue={() => {
        setEditing(false)
      }}
    />
  ) : (
    <Button
      autoFocus={prevEditing}
      aria-label={`${label}. Click to edit.`}
      {...propsWithCn(buttonProps, 'font-medium')}
      onClick={(e) => {
        buttonProps?.onClick?.(e)
        setEditing(true)
      }}
    >
      <Marquee reverse={false}>
        {value ? value : (comboboxProps.placeholder ?? '-')}
      </Marquee>
    </Button>
  )
}

interface EditableTextInnerProps extends Ariakit.ComboboxProps {
  label: string

  suggestions: string[]

  defaultValue: string

  persistValue: (value: string) => void

  discardValue: () => void
}

const EditableTextInner = (props: EditableTextInnerProps) => {
  const {
    label,
    suggestions,
    defaultValue,
    persistValue,
    discardValue,
    ...comboboxProps
  } = props

  const combobox = Ariakit.useComboboxStore({
    defaultValue,
    setSelectedValue: (value) => {
      if (typeof value === 'string') {
        persistValue(value)
      }
    },
  })
  const search = Ariakit.useStoreState(combobox, 'value')
  const deferredSearch = useDeferredValue(search)
  const matchingSuggestions = useDeferredValue(
    matchSorter(suggestions, deferredSearch),
  )

  useEffectOnce(() => {
    // Listen for key presses at the window level, otherwise Ariakit always beats us to it.
    const handleEditing = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        discardValue()
        e.stopPropagation()
        e.preventDefault()
      }

      if (e.key === 'Enter' && !combobox.getState().activeValue) {
        persistValue(combobox.getState().value)
        e.stopPropagation()
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleEditing, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleEditing, { capture: true })
    }
  })

  return (
    <Ariakit.ComboboxProvider store={combobox}>
      <Ariakit.Combobox
        aria-label={`${label}. Press Enter to save. Press Escape to cancel.`}
        {...propsWithCn(
          comboboxProps,
          'px-2.5 py-1.5 bg-dark-800 rounded-sm text-sm text-light-800',
          'min-w-0 text-sm',
          !search && 'font-light',
        )}
        placeholder={comboboxProps.placeholder ?? 'Select...'}
        onBlur={(e) => {
          comboboxProps.onBlur?.(e)
          discardValue()
        }}
      />

      {suggestions.length > 0 && (
        <Ariakit.ComboboxPopover
          portal
          sameWidth
          gutter={4}
          className={cn('rounded-lg shadow-md', 'bg-dark-300 p')}
        >
          <Ariakit.ComboboxList className={cn('max-h-80 overflow-y-auto')}>
            {matchingSuggestions.length === 0 ? (
              <div
                className={cn(
                  'text-center p-2',
                  'text-sm italic text-light-950',
                )}
              >
                No matching {label} found
              </div>
            ) : (
              matchingSuggestions.map((suggestion) => (
                <EditableTextItem key={suggestion} value={suggestion} />
              ))
            )}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      )}
    </Ariakit.ComboboxProvider>
  )
}

export { EditableText, type EditableTextProps }
