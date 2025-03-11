import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'

interface FormProps extends Ariakit.FormProps {
  options?: Ariakit.FormProviderProps
}

const Form = (props: FormProps) => {
  const { options, ...formProps } = props

  return (
    <Ariakit.FormProvider {...options}>
      <Ariakit.Form
        {...formProps}
        className={clsx('flex flex-col gap-8', formProps.className)}
      />
    </Ariakit.FormProvider>
  )
}

export { Form, type FormProps }
