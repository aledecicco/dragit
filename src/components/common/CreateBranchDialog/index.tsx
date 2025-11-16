import type { BranchName, RefName } from '@/api/models'
import { useBranchOff, useCreateBranchAt } from '@/api/mutations/createBranch'
import { showDialog } from '@/context/dialogs'
import type { DialogProps } from '@/ui/Dialog'
import { InputField } from '@/ui/Form/InputField'
import { FormDialog } from '@/ui/FormDialog'

const CREATE_BRANCH_DIALOG_KEY = 'create_branch_dialog'

interface CreateBranchDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * The reference from which to create the branch.
   */
  fromReference: RefName

  /**
   * The default name for the new branch.
   */
  branchName?: BranchName

  /**
   * Whether to jump to the created branch after creation.
   */
  jump?: boolean
}

interface CreateBranchFormValues {
  name: string
}

/**
 * Dialog that allows the user to create a branch.
 */
const CreateBranchDialog = (props: CreateBranchDialogProps) => {
  const { fromReference, branchName, jump, ...dialogProps } = props

  const defaultValues: CreateBranchFormValues = {
    name: branchName ?? '',
  }

  const createBranch = useCreateBranchAt(fromReference)
  const branchOff = useBranchOff(fromReference)

  return (
    <FormDialog
      dialogKey={CREATE_BRANCH_DIALOG_KEY}
      heading={`Branch from ${fromReference}`}
      formOptions={{
        defaultValues,
        formAction: jump ? branchOff : createBranch,
      }}
      {...dialogProps}
    >
      <InputField label="Branch name" name="name" autoFocus required />
    </FormDialog>
  )
}

const showCreateBranchDialog = (props: CreateBranchDialogProps) => {
  showDialog(CREATE_BRANCH_DIALOG_KEY, CreateBranchDialog, props)
}

export {
  CreateBranchDialog,
  showCreateBranchDialog,
  type CreateBranchDialogProps,
  type CreateBranchFormValues,
}
