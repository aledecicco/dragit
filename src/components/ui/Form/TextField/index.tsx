import { propsWithCn } from '@/utils/styles'

import { FormField, type FormFieldProps } from '../Field'

interface TextFieldProps extends FormFieldProps {}

/**
 * Textarea input field component with default styles.
 */
const TextField = (props: TextFieldProps) => {
  const { ...fieldProps } = props

  return (
    <FormField
      render={<textarea rows={5} />}
      placeholder={`Write a ${fieldProps.label}`}
      {...propsWithCn(
        fieldProps,
        'p-3 bg-dark-800 rounded-sm text-sm text-light-800 resize-none',
        'border-1 border-transparent',
        'aria-invalid:border-danger-300',
      )}
    />
  )
}

export { TextField, type TextFieldProps }
