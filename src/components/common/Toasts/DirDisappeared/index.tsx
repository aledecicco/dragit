import type { ToastArgs } from '@/lib/Toasts/Toast'
import { Chip } from '@/ui/Chip'
import { Marquee } from '@/ui/Marquee'
import { cn } from '@/utils/styles'

const dirDisappearedToast = (path: string): ToastArgs => {
  return {
    status: 'warning',
    title: 'Directory missing',
    description: <DirDisappearedToast path={path} />,
  }
}

const DirDisappearedToast = (props: { path: string }) => {
  const { path } = props

  return (
    <div className={cn('max-w-full overflow-hidden')}>
      Dragit tried to open{' '}
      <Chip size="md" className={cn('max-w-50 inline-block')}>
        <Marquee>{path}</Marquee>
      </Chip>
      , but it's no longer accessible.
    </div>
  )
}

export { dirDisappearedToast }
