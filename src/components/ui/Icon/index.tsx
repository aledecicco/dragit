import type { IconProps as TablerIconProps } from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'
import type { LiteralUnion, Size } from '@utils/types'

type Glyph = ComponentType<TablerIconProps>

interface IconProps extends TablerIconProps {
  Glyph: ComponentType<TablerIconProps>
  size?: LiteralUnion<Size>
}

const Icon = (props: IconProps) => {
  const { Glyph, size = 'md', ...iconProps } = props

  return (
    <Glyph
      {...propsWithCn(
        iconProps,
        'shrink-0',
        match(size)
          .with('sm', () => 'stroke-1.5 size-3.5')
          .with('md', () => 'stroke-1.5 size-4')
          .with('lg', () => 'stroke-2 size-5')
          .otherwise(() => size),
      )}
    />
  )
}

export { Icon, type IconProps, type Glyph }
