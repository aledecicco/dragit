import { IconUserFilled } from '@tabler/icons-react'
import type { ComponentProps } from 'react'

import { Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

interface ProfilePictureProps extends ComponentProps<'div'> {
  username: string | undefined
  size?: Size
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const { username, size = 'md', ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'rounded-full aspect-square',
        'bg-primary-900 text-primary-600 p-0.5',
        'flex items-center justify-center',
      )}
    >
      <Icon Glyph={IconUserFilled} size={size} className={cn('m-0.5')} />
    </div>
  )
}

export { ProfilePicture, type ProfilePictureProps }
