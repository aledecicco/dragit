import * as Ariakit from '@ariakit/react'

import { Button, type ButtonProps } from '@ui/Button'
import { propsWithCn } from '@utils/styles'

interface FormSubmitButtonProps extends Partial<ButtonProps> {
  options?: Ariakit.FormSubmitProps
}

const FormSubmitButton = (props: FormSubmitButtonProps) => {
  const { options, ...buttonProps } = props

  return (
    <Ariakit.FormSubmit
      render={
        <Button variant="primary" {...propsWithCn(buttonProps, 'w-full')} />
      }
      {...options}
    />
  )
}

export { FormSubmitButton, type FormSubmitButtonProps }
