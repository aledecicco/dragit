import { useState } from 'react'

import { useQueryRemotes } from '@api/queries'
import { showDialog } from '@context/dialogs'
import { QueryList } from '@lib/QueryList'
import { Button } from '@ui/Button'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { cn } from '@utils/styles'
import { idFn, mapFn } from '@utils/types'
import { RemoteForm } from './Form'
import { RemotesDialogItem } from './Item'

export const REMOTES_DIALOG_KEY = 'remotes_dialog'

interface RemotesDialogProps extends Omit<DialogProps, 'dialogKey'> {}

/**
 * Dialog that displays existing remotes and allows managing them.
 */
const RemotesDialog = (props: RemotesDialogProps) => {
  const { ...dialogProps } = props

  const [adding, setAdding] = useState(false)
  const remotesQuery = useQueryRemotes()

  const virtualizerOptions = mapFn(remotesQuery.data, (remotes) => ({
    getItemKey: (index: number) => remotes[index].name,
  }))

  return (
    <Dialog dialogKey={REMOTES_DIALOG_KEY} heading="Remotes" {...dialogProps}>
      <div
        className={cn(
          'grid max-h-60 overflow-y-hidden mb-4',
          'bg-dark-700 border-1 border-dark-300 rounded-lg',
        )}
      >
        <QueryList
          query={remotesQuery}
          RenderItem={RemotesDialogItem}
          name="remotes"
          getItems={idFn}
          itemSize={36}
          size="md"
          options={virtualizerOptions}
        />
      </div>

      {adding ? (
        <RemoteForm
          defaultValues={{ name: '', url: '' }}
          onCancel={() => {
            setAdding(false)
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
    </Dialog>
  )
}

const showRemotesDialog = (props?: Partial<RemotesDialogProps>) => {
  showDialog(REMOTES_DIALOG_KEY, <RemotesDialog {...props} />)
}

export { RemotesDialog, showRemotesDialog, type RemotesDialogProps }
