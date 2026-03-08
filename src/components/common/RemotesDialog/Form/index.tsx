import { IconX } from '@tabler/icons-react'

import { useAddRemote } from '@/api/mutations/addRemote'
import { useQueryRemotes } from '@/api/queries/remotes'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { runAction, useActionStatuses } from '@/state/actions'
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
 *
 * // TODO: autofocus URL field if name is pre-filled.
 */
const RemoteForm = (props: RemoteFormProps) => {
  const { onCancel, ...formProps } = props

  const remotesQuery = useQueryRemotes()
  const addRemote = useAddRemote()
  const status = useActionStatuses(addRemote)

  return (
    <Form
      defaultValues={{ name: '', url: '' }}
      {...propsWithCn(formProps, 'flex flex-row gap-1')}
      onFormSubmit={async (formState, form) => {
        await formProps.onFormSubmit?.(formState, form)

        if (formState.values.name && formState.values.url) {
          await runAction(addRemote, {
            name: formState.values.name,
            url: formState.values.url,
          })
        }
      }}
      validateForm={async (formState, form) => {
        await formProps.validateForm?.(formState, form)

        const exists = remotesQuery.data?.find(
          (remote) => remote.name === formState.values.name,
        )

        if (exists) {
          form.setError('name', 'Remote already exists')
        }
      }}
    >
      <InputField name="name" label="remote name" required autoFocus compact />

      <InputField
        name="url"
        label="remote URL"
        containerProps={{ className: cn('flex-1') }}
        required
        compact
      />

      <DecoratedButton
        type="submit"
        className={cn('w-max')}
        track={addRemote}
        status="primary"
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
