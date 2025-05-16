import * as Ariakit from '@ariakit/react'
import type { ReactNode } from 'react'

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
  defaultValues: T
  actionDescription: ActionDescription
  onFormSubmit: FormCallback<T>
  validateForm?: FormCallback<T>
  children?: ReactNode | ((tracker: ActionTracker) => ReactNode)
}

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
