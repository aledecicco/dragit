import type { ComponentProps } from 'react'

import { useQueryFileDiff } from '@api/queries/fileDiff'
import { cn, propsWithCn } from '@utils/styles'

interface FileDiffViewerProps extends ComponentProps<'div'> {
  reference: string
  filepath: string
}

const FileDiffViewer = (props: FileDiffViewerProps) => {
  const { reference, filepath, ...divProps } = props

  const fileDiffQuery = useQueryFileDiff(reference, filepath)

  return (
    <div {...propsWithCn(divProps, 'p-2 w-full h-full overflow-auto')}>
      <p className="text-sm text-light-500">{filepath}</p>

      {fileDiffQuery.data?.sections.map((section, i) => (
        <div key={i}>
          {section.lines.map((line, i) => (
            <p className={cn('whitespace-pre')} key={i}>
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }
