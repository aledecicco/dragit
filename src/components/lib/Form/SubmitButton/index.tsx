import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'

import { Button, type ButtonProps } from '@lib/Button'

interface FormSubmitButtonProps extends Partial<ButtonProps> {
  options?: Ariakit.FormSubmitProps
}

const FormSubmitButton = (props: FormSubmitButtonProps) => {
  const { options, ...buttonProps } = props

  return (
    <Ariakit.FormSubmit
      render={
        <Button
          variant="primary"
          {...buttonProps}
          className={clsx('[&]:w-full', buttonProps.className)}
        />
      }
      {...options}
    />
  )
}

export { FormSubmitButton, type FormSubmitButtonProps }
