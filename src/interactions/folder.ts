import {
  useChangeCurrentFolder,
  useMakeOpenRecentFolder,
  useOpenFolder,
} from '@/api/mutations/openFolder'
import { interaction } from '@/lib/ActionButton/utils'
import { chooseDirectory } from '@/utils/behavior'

const chooseFolderArgsRequester = async () => {
  const path = await chooseDirectory()
  if (!path) throw new Error('No folder selected')
  return path
}

export const useOpenFolderInteraction = () => {
  const openFolder = useOpenFolder()
  return interaction({
    action: openFolder,
    argsRequester: chooseFolderArgsRequester,
    details: 'open folder',
  })
}

export const useChangeFolderInteraction = () => {
  const changeFolder = useChangeCurrentFolder()
  return interaction({
    action: changeFolder,
    argsRequester: chooseFolderArgsRequester,
    details: 'change folder',
  })
}

export const useOpenSomeRecentFolderInteraction = () => {
  const makeOpenRecentFolder = useMakeOpenRecentFolder()

  return (folder: string) =>
    interaction({
      action: makeOpenRecentFolder(folder),
      details: `open "${folder}"`,
    })
}
