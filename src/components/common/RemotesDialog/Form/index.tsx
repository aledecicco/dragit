import { IconX } from '@tabler/icons-react'

import { useAddRemote } from '@/api/mutations/addRemote'
import { useQueryRemotes } from '@/api/queries/remotes'
import { useActionStatuses } from '@/context/actions'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { Form, type FormProps } from '@/ui/Form'
import { InputField } from '@/ui/Form/InputField'
import { FormSubmitButton } from '@/ui/Form/SubmitButton'
import { cn, propsWithCn } from '@/utils/styles'

interface RemoteFormValues {
  name: string
  url: string
}

interface RemoteFormProps
  extends Omit<FormProps<RemoteFormValues>, 'formAction'> {
  /**
   * Callback to handle form cancellation.
   */
  onCancel: () => void
}

/**
 * Form that allows creating new remotes.
 */
const RemoteForm = (props: RemoteFormProps) => {
  const { onCancel, ...formProps } = props

  const remotesQuery = useQueryRemotes()
  const addRemote = useAddRemote()
  const status = useActionStatuses(addRemote.id)

  return (
    <Form
      {...propsWithCn(formProps, 'flex flex-row gap-1')}
      defaultValues={{ name: '', url: '' }}
      formAction={addRemote}
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
      {(action) => (
        <>
          <InputField
            name="name"
            label="Remote name"
            required
            autoFocus
            compact
          />
          <InputField
            name="url"
            label="Remote URL"
            containerProps={{ className: cn('flex-1') }}
            required
            compact
          />

          <FormSubmitButton className={cn('w-max')} action={action} compact />

          <DecoratedButton
            disabled={status === 'running'}
            className={cn('w-max')}
            onClick={() => {
              onCancel()
            }}
            label="Cancel"
            Glyph={IconX}
            compact
          />
        </>
      )}
    </Form>
  )
}

export { RemoteForm, type RemoteFormProps, type RemoteFormValues }
