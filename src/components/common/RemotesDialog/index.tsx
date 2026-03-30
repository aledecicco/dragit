import { useState } from 'react'

import { useQueryRemotes } from '@/api/queries/remotes'
import { QueryList } from '@/lib/QueryList'
import { showDialog } from '@/state/dialogs'
import { Button } from '@/ui/Button'
import { Dialog, type DialogProps } from '@/ui/Dialog'
import { DialogContent } from '@/ui/Dialog/Content'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { RemoteForm } from './Form'
import { RemotesDialogItem } from './Item'

const REMOTES_DIALOG_KEY = 'remotes_dialog'

interface RemotesDialogProps extends Omit<DialogProps, 'dialogKey'> {
  /**
   * If provided, the dialog will start in "creating" mode with the remote name pre-filled.
   */
  defaultCreating?: string

  /**
   * Callback to trigger when a remote is created.
   */
  onCreate?: (name: string, url: string) => void
}

/**
 * Dialog that displays existing remotes and allows managing them.
 */
const RemotesDialog = (props: RemotesDialogProps) => {
  const { defaultCreating, onCreate, ...dialogProps } = props

  const [adding, setAdding] = useState(defaultCreating !== undefined)
  const [defaultName, setDefaultName] = useState(defaultCreating)
  const remotesQuery = useQueryRemotes()

  return (
    <Dialog
      dialogKey={REMOTES_DIALOG_KEY}
      {...propsWithCn(dialogProps, 'grid-cols-[600px] max-h-half')}
    >
      <DialogContent
        heading="Remotes"
        className={cn('h-full grid grid-rows-[max-content_1fr_max-content]')}
      >
        <div
          className={cn(
            'overflow-y-hidden mb-6',
            'bg-dark-700 border border-dark-300 rounded-lg',
          )}
        >
          <QueryList
            name="remotes"
            query={remotesQuery}
            renderItem={(remote) => <RemotesDialogItem remote={remote} />}
            itemSize={34}
            size="md"
            options={mapFn(remotesQuery.data, (remotes) => ({
              getItemKey: (index: number) => remotes[index].name,
            }))}
          />
        </div>

        {adding ? (
          <RemoteForm
            key={defaultName}
            className={cn('-mb-1 mx-px')}
            defaultValues={{ name: defaultName ?? '', url: '' }}
            onFormSubmit={({ values }) => {
              onCreate?.(values.name, values.url)
              setDefaultName(undefined)
            }}
            onCancel={() => {
              setAdding(false)
              setDefaultName(undefined)
            }}
          />
        ) : (
          <Button
            status="primary"
            className={cn('w-full')}
            onClick={() => {
              setAdding(true)
            }}
          >
            Create
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

const showRemotesDialog = (props?: Partial<RemotesDialogProps>) => {
  showDialog(REMOTES_DIALOG_KEY, RemotesDialog, props ?? {})
}

export { RemotesDialog, showRemotesDialog, type RemotesDialogProps }
