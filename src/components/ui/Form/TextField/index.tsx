import { propsWithCn } from '@utils/styles'
import { FormField, type FormFieldProps } from '../Field'

interface TextFieldProps extends FormFieldProps {}

const TextField = (props: TextFieldProps) => {
  const { ...fieldProps } = props

  return (
    <FormField
      render={<textarea rows={5} />}
      placeholder={`Write a ${fieldProps.label}`}
      {...propsWithCn(
        fieldProps,
        'p-3 bg-dark-800 rounded-sm text-sm text-light-800 resize-none',
      )}
    />
  )
}

export { TextField, type TextFieldProps }
