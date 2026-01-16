import { IconTag } from '@tabler/icons-react'

import type { RefName } from '@/api/models'
import { useQueryTags } from '@/api/queries/tags'
import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { InputField } from '@/ui/Form/InputField'
import { TextField } from '@/ui/Form/TextField'
import { cn } from '@/utils/styles'

interface CreateTagDialogProps
  extends ValueRequesterDialogProps<CreateTagFormValues> {
  /**
   * The reference from which to create the tag.
   */
  reference: RefName
}

interface CreateTagFormValues {
  name: string
  message: string
}

/**
 * Dialog that allows the user to create a tag.
 */
const CreateTagDialog = (props: CreateTagDialogProps) => {
  const { reference, ...dialogProps } = props

  const tags = useQueryTags()

  return (
    <ValueRequesterDialog
      heading={`Tag ${reference}`}
      {...dialogProps}
      formOptions={{
        ...dialogProps.formOptions,
        validateForm: (formState, form) => {
          dialogProps.formOptions?.validateForm?.(formState, form)

          if (formState.values.name.includes(' ')) {
            form.setError('tagName', 'Tag name cannot contain spaces')
          }

          const exists = tags.data?.some(
            (tag) => tag.name === formState.values.name,
          )
          if (exists) {
            form.setError('tagName', 'A tag with this name already exists')
          }
        },
      }}
    >
      <InputField label="tag name" name="name" autoFocus required />

      <TextField label="tag description" name="message" />

      <DecoratedButton
        type="submit"
        label="Create tag"
        Glyph={IconTag}
        className={cn('w-full')}
        status="primary"
      />
    </ValueRequesterDialog>
  )
}

const requestTagParams = (reference: RefName) => {
  return requestValueFromDialog(CreateTagDialog, {
    reference,
    formOptions: {
      defaultValues: {
        name: '',
        message: '',
      },
    },
  }).then(({ name, message }) => ({ tagName: name, message }))
}

export {
  CreateTagDialog,
  requestTagParams,
  type CreateTagDialogProps,
  type CreateTagFormValues,
}
