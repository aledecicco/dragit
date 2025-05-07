import { useState } from 'react'

import { Autosuggest, type AutosuggestProps } from '@ui/Autosuggest'
import { Button, type ButtonProps } from '@ui/Button'
import { Marquee } from '@ui/Marquee'

interface EditableTextProps extends AutosuggestProps {
  buttonProps: ButtonProps
  label: string
}

const EditableText = (props: EditableTextProps) => {
  const { buttonProps, label, ...inputProps } = props
  const [editing, setEditing] = useState(false)

  return editing ? (
    <Autosuggest
      autoFocus
      aria-label={`${label}. Press Enter to save.`}
      {...inputProps}
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
      {...buttonProps}
      onFocus={(e) => {
        buttonProps.onFocus?.(e)
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
