import { propsWithCn } from '@utils/styles'
import type { ComponentProps } from 'react'

interface FileDiffProps extends ComponentProps<'div'> {
  filepath: string
}

const FileDiff = (props: FileDiffProps) => {
  const { filepath, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'p-2')}>
      <p className="text-sm text-light-500">{filepath}</p>
    </div>
  )
}

export { FileDiff, type FileDiffProps }
