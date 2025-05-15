import { useMemo, useState } from 'react'

import { useQueryRemotes } from '@api/queries'
import { QueryList } from '@lib/QueryList'
import { Button } from '@ui/Button'
import { Dialog, type DialogProps } from '@ui/Dialog'
import { cn } from '@utils/styles'
import { idFn, mapFn } from '@utils/types'
import { RemoteForm } from './Form'
import { RemotesDialogItem } from './Item'

export const REMOTES_DIALOG_KEY = 'remotes_dialog'

interface RemotesDialogProps extends Omit<DialogProps, 'dialogKey'> {}

const RemotesDialog = (props: RemotesDialogProps) => {
  const { ...dialogProps } = props

  const [adding, setAdding] = useState(false)
  const remotesQuery = useQueryRemotes()

  const virtualizerOptions = useMemo(() => {
    return mapFn(remotesQuery.data, (remotes) => ({
      getItemKey: (index: number) => remotes[index].name,
    }))
  }, [remotesQuery.data])

  return (
    <Dialog dialogKey={REMOTES_DIALOG_KEY} heading="Remotes" {...dialogProps}>
      <div className={cn('h-full max-h-60 bg-dark-700 overflow-y-hidden mb-2')}>
        <QueryList
          query={remotesQuery}
          RenderItem={RemotesDialogItem}
          name="remotes"
          getItems={idFn}
          itemSize={36}
          size="sm"
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

export { RemotesDialog, type RemotesDialogProps }
