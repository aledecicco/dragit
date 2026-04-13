import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

import { FormField, type FormFieldProps } from '../Field'

interface TextFieldProps extends FormFieldProps {}

/**
 * Textarea input field component.
 */
const TextField = (props: TextFieldProps) => {
  const { ...fieldProps } = props

  const form = Ariakit.useFormContext()

  return (
    <FormField
      render={<textarea rows={5} />}
      placeholder={`Write a ${fieldProps.label}`}
      {...propsWithCn(
        fieldProps,
        'p-3 bg-dark-800 rounded-sm text-sm text-light-800 resize-none',
        'border border-transparent',
        'aria-invalid:border-danger-300',
      )}
      onKeyDown={(e) => {
        fieldProps.onKeyDown?.(e)

        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.stopPropagation()
          e.preventDefault()

          form?.submit()
        }
      }}
    />
  )
}

export { TextField, type TextFieldProps }
