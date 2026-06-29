import { IconWorldDownload } from '@tabler/icons-react'

import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { InputField } from '@/ui/Form/InputField'
import { cn } from '@/utils/styles'

interface RepositoryUrlDialogProps
  extends ValueRequesterDialogProps<RepositoryUrlFormValues> {}

interface RepositoryUrlFormValues {
  url: string
}

/**
 * Dialog that allows the user to choose a repository URL.
 */
const RepositoryUrlDialog = (props: RepositoryUrlDialogProps) => {
  const { ...dialogProps } = props

  return (
    <ValueRequesterDialog
      {...dialogProps}
      formOptions={{
        ...dialogProps.formOptions,
        validateForm: (formState, form) => {
          dialogProps.formOptions?.validateForm?.(formState, form)
        },
      }}
    >
      <DialogContent heading="Clone into current directory">
        <InputField label="URL" name="url" type="url" autoFocus required />

        <DecoratedButton
          type="submit"
          label="Choose URL"
          Glyph={IconWorldDownload}
          className={cn('w-full mt-8')}
          status="primary"
        />
      </DialogContent>
    </ValueRequesterDialog>
  )
}

const requestRepositoryUrl = async () => {
  const { url } = await requestValueFromDialog(RepositoryUrlDialog, {
    formOptions: {
      defaultValues: { url: '' },
    },
  })

  return url
}

export {
  RepositoryUrlDialog,
  requestRepositoryUrl,
  type RepositoryUrlDialogProps,
  type RepositoryUrlFormValues,
}
