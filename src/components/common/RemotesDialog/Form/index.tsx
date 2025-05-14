import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { Button } from '@ui/Button'

import { Form, type FormProps } from '@ui/Form'
import { InputField } from '@ui/Form/InputField'
import { FormSubmitButton } from '@ui/Form/SubmitButton'
import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'

interface RemoteFormValues {
  name: string
  url: string
}

interface RemoteFormProps extends FormProps<RemoteFormValues> {
  onCancel: () => void
}

const RemoteForm = (props: RemoteFormProps) => {
  const { onCancel, ...formProps } = props

  return (
    <Form {...propsWithCn(formProps, 'flex flex-row gap-1')}>
      <InputField name="name" label="Remote name" required autoFocus compact />
      <InputField
        name="url"
        label="Remote URL"
        className={cn('flex-1')}
        required
        compact
      />

      <FormSubmitButton className={cn('w-max')}>
        <Icon Glyph={IconDeviceFloppy} />
      </FormSubmitButton>
      <Button
        className={cn('w-max')}
        onClick={() => {
          onCancel()
        }}
      >
        <Icon Glyph={IconX} />
      </Button>
    </Form>
  )
}

export { RemoteForm, type RemoteFormProps }
