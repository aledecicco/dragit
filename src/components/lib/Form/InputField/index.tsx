import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { ComponentProps } from 'react'

interface InputFieldProps extends Ariakit.FormInputProps {
  name: Ariakit.FormInputProps['name']
  label: string
  container?: ComponentProps<'div'>
}

const InputField = (props: InputFieldProps) => {
  const { name, label, container, ...inputProps } = props

  return (
    <div
      {...container}
      className={clsx(
        'flex flex-col items-stretch gap-y-2',
        'relative mb-2',
        container?.className,
      )}
    >
      <Ariakit.FormLabel name={name} className={clsx('text-sm text-light-400')}>
        {label}
      </Ariakit.FormLabel>

      <Ariakit.FormInput
        name={name}
        placeholder={`Enter a ${label}`}
        {...inputProps}
        className={clsx(
          'p-3 bg-dark-800 rounded-sm text-sm text-light-800',
          inputProps.className,
        )}
      />

      <Ariakit.FormError
        name={name}
        className={clsx(
          'text-xs text-danger-300',
          'absolute top-full translate-y-1.5',
        )}
      />
    </div>
  )
}

export { InputField, type InputFieldProps }
