import { useState } from 'react'
import { IconCheck } from '@tabler/icons-react'

import {
  type UpdateInfo,
  useQueryAvailableUpdate,
} from '@/api/queries/availableUpdate'
import {
  useCheckForUpdatesInteraction,
  useInstallUpdateInteraction,
} from '@/interactions/updates'
import { ActionButton } from '@/lib/ActionButton'
import { QueryLoader } from '@/lib/QueryLoader'
import { Icon } from '@/ui/Icon'
import { ProgressBar } from '@/ui/ProgressBar'
import { cn } from '@/utils/styles'

/**
 * Displays the details of updates available to install.
 */
const UpdateDetails = () => {
  const availableUpdateQuery = useQueryAvailableUpdate()
  const checkForUpdates = useCheckForUpdatesInteraction()

  return (
    <div className={cn('min-h-11 mt-10', 'flex flex-col items-center gap-2')}>
      <QueryLoader query={availableUpdateQuery}>
        {(availableUpdate) =>
          availableUpdate ? (
            <WithUpdate update={availableUpdate} />
          ) : (
            <div className={cn('flex flex-col items-center gap-2')}>
              <p
                className={cn(
                  'text-sm text-light-900 font-light',
                  'flex flex-row items-center gap-1',
                )}
              >
                <Icon Glyph={IconCheck} size="xs" />

                <span>App is up to date</span>
              </p>

              <ActionButton
                status="neutral"
                variant="filled"
                {...checkForUpdates}
                size="xs"
              />
            </div>
          )
        }
      </QueryLoader>
    </div>
  )
}

interface WithUpdateProps {
  update: UpdateInfo
}

const WithUpdate = (props: WithUpdateProps) => {
  const { update } = props

  const [progress, setProgress] = useState<number>()
  const installUpdate = useInstallUpdateInteraction((newProgress) => {
    if (newProgress === 100) {
      setProgress(undefined)
    } else {
      setProgress(newProgress)
    }
  })

  return (
    <>
      <p className={cn('text-sm text-light-500 font-semibold')}>
        A new version is available
      </p>

      <p
        className={cn(
          'w-full bg-dark-800 p-4 rounded-sm max-h-40 overflow-auto',
          'text-sm text-light-900 font-light whitespace-pre-wrap',
          !update.description && 'italic text-light-900/75',
        )}
      >
        {update.description ? update.description : 'No description.'}
      </p>

      <p className={cn('text-sm text-light-500 font-light')}>
        v{update.version}
        {update.date &&
          ` - ${update.date.toLocaleDateString()} at ${update.date.toLocaleTimeString()}`}
      </p>

      <ActionButton
        {...installUpdate}
        status="primary"
        variant="filled"
        className={cn('mt-4')}
      />

      {progress !== undefined && (
        <div className={cn('w-full flex flex-col items-center gap-1 mt-2')}>
          <ProgressBar progress={progress} />
          <p className={cn('text-sm text-light-500 mt-1')}>
            {progress}% downloaded
          </p>
        </div>
      )}
    </>
  )
}

export { UpdateDetails }
