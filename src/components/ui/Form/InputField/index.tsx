import { propsWithCn } from '@/utils/styles'

import { FormField, type FormFieldProps } from '../Field'

interface InputFieldProps extends FormFieldProps {}

/**
 * Input field component with default styles.
 */
const InputField = (props: InputFieldProps) => {
  const { ...fieldProps } = props

  return (
    <FormField
      placeholder={`Enter a ${fieldProps.label}`}
      {...propsWithCn(
        fieldProps,
        'p-3 text-sm bg-dark-800 rounded-sm text-light-800',
        fieldProps.compact && 'px-2 py-1',
        'border-1 border-transparent',
        'aria-invalid:border-danger-300',
      )}
    />
  )
}

export { InputField, type InputFieldProps }
