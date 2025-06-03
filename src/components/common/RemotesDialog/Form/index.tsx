import { IconDeviceFloppy, IconX } from '@tabler/icons-react'

import { useAddRemote } from '@api/mutations'
import { useQueryRemotes } from '@api/queries'
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
  extends Omit<
    FormProps<RemoteFormValues>,
    'onFormSubmit' | 'actionDescription'
  > {
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

  return (
    <Form
      {...propsWithCn(formProps, 'flex flex-row gap-1')}
      defaultValues={{ name: '', url: '' }}
      actionDescription={{
        Glyph: IconDeviceFloppy,
        label: {
          idle: 'Save',
          running: 'Saving',
          success: 'Saved',
          error: 'Failed',
        },
      }}
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
      {(actionTracker) => (
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

          <FormSubmitButton
            className={cn('w-max')}
            actionTracker={actionTracker}
            compact
          />

          <Button
            disabled={actionTracker.actionState === 'running'}
            className={cn('w-max')}
            onClick={() => {
              onCancel()
            }}
            description="Cancel"
          >
            <Icon Glyph={IconX} />
          </Button>
        </>
      )}
    </Form>
  )
}

export { RemoteForm, type RemoteFormProps }
