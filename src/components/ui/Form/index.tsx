import * as Ariakit from '@ariakit/react'
import type { ReactNode } from 'react'

import { type Action, ActionButton } from '@lib/ActionButton'
import {
  type ActionDescription,
  type ActionTracker,
  useActionTracker,
} from '@lib/ActionButton/utils'
import { propsWithCn } from '@utils/styles'
import type { AnyObject } from '@utils/types'

type FormCallback<T extends AnyObject> = (
  formState: Ariakit.FormStoreState<T>,
  form: Ariakit.FormStore<T>,
) => void | Promise<void>

interface FormProps<T extends AnyObject>
  extends Omit<Ariakit.FormProps, 'children'> {
  /**
   * The default values for the form fields.
   */
  defaultValues: T

  /**
   * The description of the action that the form performs on submit.
   */
  actionDescription: ActionDescription

  /**
   * Callback that is triggered when the form is submitted.
   */
  onFormSubmit: FormCallback<T>

  /**
   * Callback triggered for form validation.
   */
  validateForm?: FormCallback<T>

  /**
   * The children of the form, which can be a function that receives the state of the tracked form action.
   */
  children?: ReactNode | ((tracker: ActionTracker) => ReactNode)
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
    actionDescription,
    onFormSubmit,
    validateForm,
    children,
    ...formProps
  } = props

  const form = Ariakit.useFormStore({ defaultValues })

  const actionTracker = useActionTracker(actionDescription, 'primary')

  form.useSubmit((formState) => {
    const res = onFormSubmit(formState, form)

    if (res) {
      actionTracker.trackAction(res, actionDescription)
    }

    return res
  })

  form.useValidate((formState) => {
    return validateForm?.(formState, form)
  })

  return (
    <Ariakit.FormProvider store={form}>
      <Ariakit.Form {...propsWithCn(formProps, 'flex flex-col gap-8')}>
        {typeof children === 'function' ? children(actionTracker) : children}
      </Ariakit.Form>
    </Ariakit.FormProvider>
  )
}

export { Form, type FormProps, type FormCallback }
