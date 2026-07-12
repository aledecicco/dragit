import { IconPlus } from '@tabler/icons-react'

import type { BranchName, RefName } from '@/api/models'
import { useQueryBranches } from '@/api/queries/branches'
import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { InputField } from '@/ui/Form/InputField'
import { cn } from '@/utils/styles'

interface CreateBranchDialogProps
  extends ValueRequesterDialogProps<CreateBranchFormValues> {
  /**
   * The reference from which to create the branch.
   */
  fromReference: RefName
}

interface CreateBranchFormValues {
  name: string
}

/**
 * Dialog that allows the user to create a branch.
 */
const CreateBranchDialog = (props: CreateBranchDialogProps) => {
  const { fromReference, ...dialogProps } = props

  const branches = useQueryBranches()

  return (
    <ValueRequesterDialog
      {...dialogProps}
      formOptions={{
        ...dialogProps.formOptions,
        validateForm: (formState, form) => {
          dialogProps.formOptions?.validateForm?.(formState, form)

          const exists = branches.data?.some(
            (branch) => branch.name === formState.values.name,
          )
          if (exists) {
            form.setError('name', 'A branch with this name already exists')
          }
        },
      }}
    >
      <DialogContent
        heading={
          <>
            Branch from{' '}
            <span className={cn('font-semibold text-primary-300')}>
              {fromReference}
            </span>
          </>
        }
      >
        <InputField label="branch name" name="name" autoFocus required />

        <DecoratedButton
          type="submit"
          label="Create branch"
          Glyph={IconPlus}
          className={cn('w-full mt-8')}
          status="primary"
        />
      </DialogContent>
    </ValueRequesterDialog>
  )
}

const requestBranchName = async (
  fromReference: RefName,
  defaultName: BranchName = '',
) => {
  const { name } = await requestValueFromDialog(CreateBranchDialog, {
    fromReference,
    formOptions: {
      defaultValues: { name: defaultName },
    },
  })

  return name
}

export {
  CreateBranchDialog,
  requestBranchName,
  type CreateBranchDialogProps,
  type CreateBranchFormValues,
}
