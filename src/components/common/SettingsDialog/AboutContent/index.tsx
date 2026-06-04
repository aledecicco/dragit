import { IconBrandGithub } from '@tabler/icons-react'

import { useQueryAppInfo } from '@/api/queries/appInfo'
import { DecoratedButton } from '@/lib/DecoratedButton'
import { QueryLoader } from '@/lib/QueryLoader'
import { DialogContent } from '@/ui/Dialog/Content'
import { openLink } from '@/utils/behavior'
import { cn } from '@/utils/styles'

import { UpdateDetails } from '../UpdateDetails'

/**
 * The content of the about section of the settings dialog.
 */
const SettingsDialogAboutContent = () => {
  const appInfoQuery = useQueryAppInfo()

  return (
    <DialogContent heading="About">
      <div className={cn('grid auto-rows-auto')}>
        <div
          className={cn('min-h-15', 'w-full flex flex-col items-center gap-2')}
        >
          <QueryLoader query={appInfoQuery}>
            {(appInfo) => (
              <>
                <h2 className={cn('text-2xl font-bold')}>{appInfo.name}</h2>
                <p className={cn('text-md text-light-500 font-semibold')}>
                  v{appInfo.version}
                </p>
              </>
            )}
          </QueryLoader>
        </div>

        <UpdateDetails />

        <div className={cn('w-full grid grid-cols-1 gap-2 mt-10')}>
          <p className={cn('text-sm text-center text-light-500')}>
            Made by Alejandro De Cicco
          </p>
          <DecoratedButton
            Glyph={IconBrandGithub}
            label="View source"
            size="sm"
            variant="filled"
            status="neutral"
            onClick={() => {
              openLink('https://github.com/aledecicco/dragit')
            }}
          />
        </div>
      </div>
    </DialogContent>
  )
}

export { SettingsDialogAboutContent }
