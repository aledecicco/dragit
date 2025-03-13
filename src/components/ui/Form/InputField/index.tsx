import * as Ariakit from '@ariakit/react'
import type { ComponentProps } from 'react'

import { cn, propsWithCn } from '@utils/styles'

interface InputFieldProps extends Ariakit.FormInputProps {
  name: Ariakit.FormInputProps['name']
  label: string
  containerProps?: ComponentProps<'div'>
}

const InputField = (props: InputFieldProps) => {
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
      </Ariakit.FormLabel>

      <Ariakit.FormInput
        name={name}
        placeholder={`Enter a ${label}`}
        {...propsWithCn(
          inputProps,
          'p-3 bg-dark-800 rounded-sm text-sm text-light-800',
        )}
      />

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

export { InputField, type InputFieldProps }
