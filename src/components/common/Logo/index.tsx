import type { ComponentProps, SVGProps } from 'react'

import logo from '@/assets/logo.svg'

import type { Glyph } from '@/ui/Icon'

const LogoGlyph = (props: ComponentProps<Glyph>) => {
  return (
    <svg
      overflow="visible"
      viewBox="4 4 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      {...(props as SVGProps<SVGSVGElement>)}
      aria-label="Dragit logo"
    >
      <image href={logo} width={20} height={20} />
    </svg>
  )
}

export { LogoGlyph }
