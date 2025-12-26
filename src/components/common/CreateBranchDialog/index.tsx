import type { BranchName, RefName } from '@/api/models'
import { useCreateBranchAt } from '@/api/mutations/createBranch'
import { useQueryBranches } from '@/api/queries/branches'
import { DecoratedButton } from '@/lib/DecoratedButton'
import {
  requestValueFromDialog,
  ValueRequesterDialog,
  type ValueRequesterDialogProps,
} from '@/lib/ValueRequester/Dialog'
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

  const createBranch = useCreateBranchAt(fromReference)

  return (
    <ValueRequesterDialog
      heading={`Branch from ${fromReference}`}
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
      <InputField label="branch name" name="name" autoFocus required />

      <DecoratedButton
        type="submit"
        label={createBranch.label.idle}
        Glyph={createBranch.Glyph}
        className={cn('w-full')}
        status="primary"
      />
    </ValueRequesterDialog>
  )
}

const requestBranchName = (
  fromReference: RefName,
  defaultName: BranchName = '',
): Promise<BranchName> => {
  return requestValueFromDialog(CreateBranchDialog, {
    fromReference,
    formOptions: {
      defaultValues: { name: defaultName },
    },
  }).then(({ name }) => name)
}
export {
  CreateBranchDialog,
  requestBranchName,
  type CreateBranchDialogProps,
  type CreateBranchFormValues,
}
