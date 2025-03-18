import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@utils/styles'
import type { AnyObject } from '@utils/types'

type FormCallback<T extends AnyObject> = (
  formState: Ariakit.FormStoreState<T>,
  form: Ariakit.FormStore<T>,
) => void | Promise<void>

interface FormProps<T extends AnyObject> extends Ariakit.FormProps {
  defaultValues: T
  onFormSubmit: FormCallback<T>
  validateForm?: FormCallback<T>
}

const Form = <T extends AnyObject>(props: FormProps<T>) => {
  const { defaultValues, onFormSubmit, validateForm, ...formProps } = props

  const form = Ariakit.useFormStore({ defaultValues })

  form.useSubmit((formState) => {
    onFormSubmit(formState, form)
  })

  form.useValidate((formState) => {
    validateForm?.(formState, form)
  })

  return (
    <Ariakit.FormProvider store={form}>
      <Ariakit.Form {...propsWithCn(formProps, 'flex flex-col gap-8')} />
    </Ariakit.FormProvider>
  )
}

export { Form, type FormProps, type FormCallback }
