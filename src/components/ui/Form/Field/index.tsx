import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'

import { cn, propsWithCn } from '@utils/styles'

interface FormFieldProps extends Ariakit.FormInputProps {
  name: Ariakit.FormInputProps['name']
  label: string
  containerProps?: ComponentProps<'div'>
}

const FormField = (props: FormFieldProps) => {
  const { name, label, containerProps, ...inputProps } = props

  return (
    <div
      {...propsWithCn(
        containerProps,
        'flex flex-col items-stretch gap-y-2',
        'relative mb-2',
      )}
    >
      <Ariakit.FormLabel name={name} className={cn('text-sm text-light-400')}>
        {label}
        {inputProps.required && ' *'}
      </Ariakit.FormLabel>

      <Ariakit.FormInput name={name} {...inputProps} />

      <Ariakit.FormError
        name={name}
        className={cn(
          'text-xs text-danger-300',
          'absolute top-full translate-y-1.5',
        )}
      />
    </div>
  )
}

export { FormField, type FormFieldProps }
