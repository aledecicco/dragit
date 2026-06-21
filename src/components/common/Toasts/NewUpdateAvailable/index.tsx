import { IconCloudSearch } from '@tabler/icons-react'

import type { UpdateInfo } from '@/api/queries/availableUpdate'
import { showSettingsDialog } from '@/common/SettingsDialog'
import { DecoratedButton } from '@/lib/DecoratedButton'
import type { ToastArgs } from '@/lib/Toasts/Toast'
import { Chip } from '@/ui/Chip'
import { cn } from '@/utils/styles'
import { useDateInfo } from '@/utils/time'

const newUpdateAvailableToast = (update: UpdateInfo): ToastArgs => {
  return {
    status: 'primary',
    title: 'Update available',
    description: <NewUpdateAvailableToast update={update} />,
  }
}

const NewUpdateAvailableToast = (props: { update: UpdateInfo }) => {
  const { update } = props

  const releaseTime = useDateInfo(update.date)

  return (
    <div className={cn('max-w-full overflow-hidden')}>
      New version{' '}
      <Chip size="md" className={cn('inline-block')}>
        v{update.version}
      </Chip>{' '}
      is available, released {releaseTime}.
      <DecoratedButton
        label="View and install"
        Glyph={IconCloudSearch}
        className={cn('toast-action mt-4')}
        onClick={() => {
          showSettingsDialog({ initialTab: 'about' })
        }}
        status="primary"
        variant="filled"
        size="md"
      />
    </div>
  )
}

export { newUpdateAvailableToast }
