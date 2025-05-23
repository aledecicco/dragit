import { IconGitBranch, IconLocationFilled } from '@tabler/icons-react'
import { memo } from 'react'
import { match } from 'ts-pattern'

import type { BranchInfo } from '@api/models'
import { useCheckout } from '@api/mutations'
import { Icon } from '@ui/Icon'
import { ListItem, type ListItemProps } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import { getRemoteCounterpart, useSelectedBranches } from '@utils/repository'
import { cn, propsWithCn } from '@utils/styles'
import { useDateDifference } from '@utils/time'

interface BranchesListItemProps extends ListItemProps {
  item: BranchInfo
}

const BranchesListItem = memo((props: BranchesListItemProps) => {
  const { item, ...itemProps } = props
  const lastModified = useDateDifference(item.timestamp)

  const remoteCounterpart = getRemoteCounterpart(item)

  const { branch } = useSelectedBranches()
  const isCurrentBranch = branch && item.name === branch.name
  const checkout = useCheckout()

  return (
    <ListItem
      aria-selected={isCurrentBranch}
      {...propsWithCn(
        itemProps,
        'border-1 border-solid border-transparent',
        isCurrentBranch && 'bg-dark-500 border-accent-300',
      )}
      onClick={(e) => {
        itemProps.onClick?.(e)
        if (e.detail === 0) {
          checkout.mutateAsync({ reference: item.name })
        }
      }}
    >
      <div className={cn('flex flex-row gap-x-1 items-center text-light-600')}>
        <Icon Glyph={IconGitBranch} size="md" />

        <Marquee className={cn('text-sm')}>{item.name}</Marquee>

        {isCurrentBranch && (
          <Icon
            Glyph={IconLocationFilled}
            size="sm"
            className={cn('text-accent-400/90')}
          />
        )}
      </div>

      <Marquee className={cn('text-xs text-light-950')} reverse={false}>
        {match(item.type)
          .with('local', () => 'Local branch')
          .with('remote', () => 'Remote branch')
          .exhaustive()}
        {remoteCounterpart && (
          <>
            , tracking{' '}
            <span className={cn('text-light-400')}>{remoteCounterpart}</span>
          </>
        )}
      </Marquee>
      <Marquee className={cn('text-xs text-light-950/60 mt-2')} reverse={false}>
        Last modified {lastModified}
      </Marquee>
    </ListItem>
  )
})

export { BranchesListItem, type BranchesListItemProps }
