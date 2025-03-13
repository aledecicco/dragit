import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@utils/styles'

interface FormProps extends Ariakit.FormProps {
  options?: Ariakit.FormProviderProps
}

const Form = (props: FormProps) => {
  const { options, ...formProps } = props

  return (
    <Ariakit.FormProvider {...options}>
      <Ariakit.Form {...propsWithCn(formProps, 'flex flex-col gap-8')} />
    </Ariakit.FormProvider>
  )
}

export { Form, type FormProps }
