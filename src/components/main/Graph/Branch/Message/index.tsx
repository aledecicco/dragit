import clsx from 'clsx'
import type { HTMLProps } from 'react'

interface BranchMessageProps extends HTMLProps<HTMLParagraphElement> {
  isBase: boolean
}

const BranchMessage = (props: BranchMessageProps) => {
  const { isBase, ...pProps } = props

  return (
    <p
      {...pProps}
      className={clsx(
        'text-center text-light-500 italic',
        'absolute top-10 w-half',
        isBase ? 'left-half' : 'left-0',
        pProps.className,
      )}
    />
  )
}

export { BranchMessage, type BranchMessageProps }
