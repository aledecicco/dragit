import { useComboboxStore, useStoreState } from '@ariakit/react'
import { useEffect, useState } from 'react'

import { Autosuggest, type AutosuggestProps } from '@ui/Autosuggest'
import { Button, type ButtonProps } from '@ui/Button'
import { Marquee } from '@ui/Marquee'
import { propsWithCn } from '@utils/styles'

interface EditableTextProps extends AutosuggestProps {
  label: string
  buttonProps?: ButtonProps
}

const EditableText = (props: EditableTextProps) => {
  const { buttonProps, label, ...inputProps } = props
  const [editing, setEditing] = useState(false)

  const store = useComboboxStore()
  const isOpen = useStoreState(store, 'open')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const showingSuggestions = isOpen && inputProps.suggestions?.length

      if (editing && !showingSuggestions && e.key === 'Escape') {
        setEditing(false)
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', handler, { capture: true })

    return () => {
      window.removeEventListener('keydown', handler, { capture: true })
    }
  }, [editing, isOpen, inputProps.suggestions?.length])

  return editing ? (
    <Autosuggest
      autoFocus
      aria-label={`${label}. Press Enter to save. Press Escape to cancel.`}
      store={store}
      {...propsWithCn(inputProps, 'font-medium')}
      setValue={(value) => {
        setEditing(false)
        inputProps.setValue(value)
      }}
      onBlur={(e) => {
        inputProps.onBlur?.(e)
        setEditing(false)
      }}
    />
  ) : (
    <Button
      aria-label={`${label}. Click to edit.`}
      {...propsWithCn(buttonProps, 'font-medium')}
      onFocus={(e) => {
        buttonProps?.onFocus?.(e)
        setEditing(true)
      }}
    >
      <Marquee reverse={false}>
        {inputProps.value ?? inputProps.placeholder}
      </Marquee>
    </Button>
  )
}

export { EditableText, type EditableTextProps }
