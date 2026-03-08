import type { SVGProps } from 'react'

import logo from '@/assets/logo.svg'

import type { Glyph } from '@/ui/Icon'

const LogoGlyph: Glyph = (props) => {
  return (
    <svg
      {...(props as SVGProps<SVGSVGElement>)}
      viewBox="6 6 12 12"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DraGit logo"
    >
      <image href={logo} x={-2} y={-2} width={28} height={28} />
    </svg>
  )
}

export { LogoGlyph }
