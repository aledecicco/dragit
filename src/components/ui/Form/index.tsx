import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'

import { type Action, useRunAction } from '@/context/actions'
import { ActionButton } from '@/lib/ActionButton'
import { propsWithCn } from '@/utils/styles'
import type { AnyObject } from '@/utils/types'

type FormCallback<T extends AnyObject> = (
  formState: Ariakit.FormStoreState<T>,
  form: Ariakit.FormStore<T>,
) => void | Promise<void>

type FormAction<T extends AnyObject> = Action<Parameters<FormCallback<T>>>

interface FormProps<T extends AnyObject>
  extends Omit<Ariakit.FormProps, 'children'> {
  /**
   * The default values for the form fields.
   */
  defaultValues: T

  /**
   * The action performed by the form.
   */
  formAction: FormAction<T>

  /**
   * Callback triggered for form validation.
   */
  validateForm?: FormCallback<T>

  /**
   * Callback triggered when the form is submitted.
   */
  onFormSubmit?: FormCallback<T>

  /**
   * The children of the form, which can be a function that receives the status of the tracked form action.
   */
  children?: ReactNode | ((action: FormAction<T>) => ReactNode)
}

/**
 * Form component that handles validation and submission, and provides its state to the fields it contains.
 *
 * The form submission callback is treated as an {@link Action}, and the submission button is an {@link ActionButton} that tracks it.
 *
 * @template T - The type of the form values.
 */
const Form = <T extends AnyObject>(props: FormProps<T>) => {
  const {
    defaultValues,
    formAction,
    validateForm,
    onFormSubmit,
    children,
    ...formProps
  } = props

  const run = useRunAction()
  const form = Ariakit.useFormStore({ defaultValues })

  form.useSubmit((formState) => {
    return run(formAction.id, () => formAction.run([formState, form])).then(
      () => {
        onFormSubmit?.(formState, form)
      },
    )
  })

  form.useValidate((formState) => {
    return validateForm?.(formState, form)
  })

  return (
    <Ariakit.FormProvider store={form}>
      <Ariakit.Form {...propsWithCn(formProps, 'flex flex-col gap-8')}>
        {typeof children === 'function' ? children(formAction) : children}
      </Ariakit.Form>
    </Ariakit.FormProvider>
  )
}

export { Form, type FormProps, type FormCallback, type FormAction }
