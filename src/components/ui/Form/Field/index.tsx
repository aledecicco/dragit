import type { ComponentProps } from 'react'
import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

interface FormFieldProps extends Ariakit.FormInputProps {
  /**
   * The field's name, which is used to identify it in the form state.
   */
  name: Ariakit.FormInputProps['name']

  /**
   * The field's label.
   */
  label: string

  /**
   * Whether to display the field in a compact form, without its label.
   * Defaults to `false`.
   */
  compact?: boolean

  /**
   * Additional props for the container element.
   */
  containerProps?: ComponentProps<'div'>
}

/**
 * Generic form field component that renders an arbitrary input field with a label and its error message if any.
 *
 * In its compact form, the label is not displayed.
 *
 * The error message is displayed floating below the input field so it doesn't take up a different amount of space
 * when it appears or disappears.
 */
const FormField = (props: FormFieldProps) => {
  const { name, label, compact = false, containerProps, ...inputProps } = props

  return (
    <div
      {...propsWithCn(
        containerProps,
        'flex flex-col items-stretch gap-y-2',
        'relative mb-2',
      )}
    >
      {!compact && (
        <Ariakit.FormLabel name={name} className={cn('text-sm text-light-400')}>
          {label}
          {inputProps.required && ' *'}
        </Ariakit.FormLabel>
      )}

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
