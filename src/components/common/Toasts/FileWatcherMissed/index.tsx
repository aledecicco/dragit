import type { ToastArgs } from '@/lib/Toasts/Toast'

const fileWatcherMissedToast: () => ToastArgs = () => {
  return {
    status: 'danger',
    title: 'File watcher out of sync',
    description: <FileWatcherMissedToast />,
  }
}

const FileWatcherMissedToast = () => {
  return 'Some file changes might not have been detected by the file watcher. Please refresh the app.'
}

export { fileWatcherMissedToast }
