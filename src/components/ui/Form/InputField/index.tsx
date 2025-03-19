import { propsWithCn } from '@utils/styles'
import { FormField, type FormFieldProps } from '../Field'

interface InputFieldProps extends FormFieldProps {}

const InputField = (props: InputFieldProps) => {
  const { ...fieldProps } = props

  return (
    <FormField
      placeholder={`Enter a ${fieldProps.label}`}
      {...propsWithCn(
        fieldProps,
        'p-3 bg-dark-800 rounded-sm text-sm text-light-800',
        'border-1 border-transparent',
        'aria-invalid:border-danger-300',
      )}
    />
  )
}

export { InputField, type InputFieldProps }
