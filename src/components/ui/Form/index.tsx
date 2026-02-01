import * as Ariakit from '@ariakit/react'
import { useEffectOnce } from 'react-use'

import { propsWithCn } from '@/utils/styles'
import type { AnyObject } from '@/utils/types'

type FormCallback<T extends AnyObject> = (
  formState: Ariakit.FormStoreState<T>,
  form: Ariakit.FormStore<T>,
) => void | Promise<void>

interface FormProps<T extends AnyObject> extends Ariakit.FormProps {
  /**
   * The default values for the form fields.
   */
  defaultValues: T

  /**
   * Callback triggered for form validation.
   */
  validateForm?: FormCallback<T>

  /**
   * Callback triggered when the form is submitted.
   */
  onFormSubmit?: FormCallback<T>
}

/**
 * Form component that handles validation and submission, and provides its state to the fields it contains.
 *
 * @template T - The type of the form values.
 */
const Form = <T extends AnyObject>(props: FormProps<T>) => {
  const { defaultValues, validateForm, onFormSubmit, ...formProps } = props

  const form = Ariakit.useFormStore({ defaultValues })

  useEffectOnce(() => {
    const cleanupSubmit = form.onSubmit((formState) => {
      return onFormSubmit?.(formState, form)
    })

    const cleanupValidate = form.onValidate((formState) => {
      return validateForm?.(formState, form)
    })

    return () => {
      cleanupSubmit()
      cleanupValidate()
    }
  })

  return (
    <Ariakit.Form
      store={form}
      {...propsWithCn(formProps, 'flex flex-col gap-8')}
    />
  )
}

export { Form, type FormProps, type FormCallback }
