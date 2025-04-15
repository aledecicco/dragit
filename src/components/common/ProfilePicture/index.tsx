import { IconUserFilled } from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

type ProfilePictureVariant = 'accent' | 'primary' | 'neutral'

interface ProfilePictureProps extends ComponentProps<'div'> {
  username: string | undefined
  variant?: ProfilePictureVariant
  size?: Size
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const { username, variant = 'primary', size = 'md', ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'rounded-full aspect-square p-0.5',
        match(variant)
          .with('accent', () => 'bg-accent-800 text-accent-600')
          .with('primary', () => 'bg-primary-800 text-primary-600')
          .with('neutral', () => 'bg-dark-200 text-light-950')
          .exhaustive(),
        'flex items-center justify-center',
      )}
    >
      <Icon Glyph={IconUserFilled} size={size} className={cn('m-0.5')} />
    </div>
  )
}

export { ProfilePicture, type ProfilePictureProps, type ProfilePictureVariant }
