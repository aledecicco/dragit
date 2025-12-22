import { useCurrentPath } from '@/api/utils'
import { Button, type ButtonProps } from '@/ui/Button'
import { Marquee } from '@/ui/Marquee'
import { openFile } from '@/utils/interaction'
import { splitPath } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

interface FileViewerTitleProps extends ButtonProps {
  /**
   * The path of the file being displayed.
   */
  filepath: string

  /**
   * An optional annotation to display alongside the file path.
   */
  annotation?: string
}

const FileViewerTitle = (props: FileViewerTitleProps) => {
  const { filepath, annotation, ...buttonProps } = props

  const repoPath = useCurrentPath()
  const segments = splitPath(`./${filepath}`)

  return (
    <Button
      {...propsWithCn(
        buttonProps,
        'font-medium',
        'hover:underline focus:underline bg-transparent!',
        'px-0 py-0.5',
      )}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        openFile(`${repoPath}/${filepath}`)
      }}
    >
      <Marquee className={cn('text-light-700')}>
        {segments.map((segment, i, all) => (
          <span key={`${i + 1}`}>
            {segment}

            {i < all.length - 1 && (
              <span className={cn('text-light-300 mx-px')}>/</span>
            )}
          </span>
        ))}

        <span className={cn('text-light-900 text-sm italic ml-2')}>
          {annotation}
        </span>
      </Marquee>
    </Button>
  )
}

export { FileViewerTitle, type FileViewerTitleProps }
