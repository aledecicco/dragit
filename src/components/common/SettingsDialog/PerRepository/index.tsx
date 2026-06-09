import { useSetRepositoryStorage } from '@/api/mutations/setRepositoryStorage'
import { triggerInteraction } from '@/state/actions'
import { useCurrentRepositoryStorage } from '@/state/storage'
import { cn } from '@/utils/styles'

import { CheckboxSetting } from '../CheckboxSetting'
import { TextSetting } from '../TextSetting'

const DEFAULT_BASE_BRANCH = 'main'

const PerRepositoryPreferences = () => {
  const repositoryStorage = useCurrentRepositoryStorage()
  const setRepositoryStorage = useSetRepositoryStorage()

  return (
    <>
      <CheckboxSetting
        label="Use remote-tracking branch as default base for comparison"
        description="The default base branch will be the one being tracked by the current branch"
        checked={repositoryStorage ? !repositoryStorage.defaultBase : true}
        onChange={(e) => {
          triggerInteraction({
            action: setRepositoryStorage,
            argsRequester: () => ({
              defaultBase: e.target.checked ? null : DEFAULT_BASE_BRANCH,
            }),
          })
        }}
      />

      {!!repositoryStorage?.defaultBase && (
        <TextSetting
          label="Default base branch name"
          value={repositoryStorage.defaultBase}
          placeholder="..."
          contentBefore={
            <>
              <li
                className={cn(
                  'relative list-none pl-8',
                  'before:absolute before:left-2.25 before:-top-7.75 before:h-8 before:w-5',
                  'before:border-l before:border-b before:border-light-600/20',
                )}
              />
              Use{' '}
            </>
          }
          contentAfter=" as default base branch for comparison"
          setValue={(newBase) => {
            triggerInteraction({
              action: setRepositoryStorage,
              argsRequester: () => ({
                defaultBase: newBase,
              }),
            })
          }}
          divProps={{
            className: cn('relative'),
          }}
        />
      )}
    </>
  )
}

export { PerRepositoryPreferences }
