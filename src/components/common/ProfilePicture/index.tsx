import { IconUserFilled } from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { useQueryGithubProfilePicture } from '@api/queries'
import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

type ProfilePictureVariant = 'accent' | 'primary' | 'neutral'

type ProfilePictureSource = 'github' // TODO: add more

interface ProfilePictureProps extends ComponentProps<'div'> {
  username: string | undefined
  variant?: ProfilePictureVariant
  size?: Size
  source?: ProfilePictureSource
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const {
    username,
    variant = 'neutral',
    size = 'md',
    source = 'github',
    ...divProps
  } = props

  const picture = useQueryGithubProfilePicture(username)

  return (
    <div
      {...propsWithCn(
        divProps,
        'rounded-full overflow-hidden',
        match(size)
          .with('sm', () => 'size-4')
          .with('md', () => 'size-5.5')
          .with('lg', () => 'size-7')
          .otherwise(() => size),
        match(variant)
          .with('accent', () => 'bg-accent-800 text-accent-600')
          .with('primary', () => 'bg-primary-800 text-primary-600')
          .with('neutral', () => 'bg-dark-200 text-light-950')
          .exhaustive(),
        'flex items-center justify-center',
      )}
    >
      {picture?.data ? (
        <img
          src={picture.data}
          alt={username}
          className={cn('w-full h-full')}
        />
      ) : (
        <Icon Glyph={IconUserFilled} className={cn('w-full h-full p-0.5')} />
      )}
    </div>
  )
}

export { ProfilePicture, type ProfilePictureProps, type ProfilePictureVariant }
