import { IconX } from '@tabler/icons-react'

import { useAddRemote } from '@/api/mutations/addRemote'
import { useQueryRemotes } from '@/api/queries/remotes'
import { useActionStatuses } from '@/context/actions'
import { ActionButton } from '@/lib/ActionButton'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { Form, type FormProps } from '@/ui/Form'
import { InputField } from '@/ui/Form/InputField'
import { cn, propsWithCn } from '@/utils/styles'

interface RemoteFormValues {
  name: string
  url: string
}

interface RemoteFormProps extends Partial<FormProps<RemoteFormValues>> {
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
      defaultValues={{ name: '', url: '' }}
      {...propsWithCn(formProps, 'flex flex-row gap-1')}
      validateForm={(formState, form) => {
        formProps.validateForm?.(formState, form)

        const exists = remotesQuery.data?.find(
          (remote) => remote.name === formState.values.name,
        )

        if (exists) {
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

      <ActionButton
        type="submit"
        className={cn('w-max')}
        mainAction={addRemote}
        compact
      />

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
    </Form>
  )
}

export { RemoteForm, type RemoteFormProps, type RemoteFormValues }
