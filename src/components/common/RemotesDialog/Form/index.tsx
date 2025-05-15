import { useAddRemote } from '@api/mutations'
import { useQueryRemotes } from '@api/queries'
import { useFormContext } from '@ariakit/react'
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

interface RemoteFormProps
  extends Omit<FormProps<RemoteFormValues>, 'onFormSubmit'> {
  onCancel: () => void
}

const RemoteForm = (props: RemoteFormProps) => {
  const { onCancel, ...formProps } = props

  const remotesQuery = useQueryRemotes()
  const addRemote = useAddRemote()

  return (
    <Form
      {...propsWithCn(formProps, 'flex flex-row gap-1')}
      defaultValues={{ name: '', url: '' }}
      onFormSubmit={async (formState) => {
        if (formState.values.name && formState.values.url) {
          await addRemote.mutateAsync({
            name: formState.values.name,
            url: formState.values.url,
          })
        }
      }}
      validateForm={(formState, form) => {
        if (
          remotesQuery.data?.find(
            (remote) => remote.name === formState.values.name,
          )
        ) {
          form.setError('name', 'Remote already exists')
        }
      }}
    >
      <InputField name="name" label="Remote name" required autoFocus compact />
      <InputField
        name="url"
        label="Remote URL"
        containerProps={{ className: cn('flex-1') }}
        required
        compact
      />

      <FormSubmitButton
        className={cn('w-max')}
        compact
        action={{
          Glyph: IconDeviceFloppy,
          label: {
            idle: 'Create',
            running: 'Creating',
            success: 'Created',
            error: 'Failed',
          },
        }}
      />

      <Button
        disabled={useFormContext()?.getState().submitting}
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
