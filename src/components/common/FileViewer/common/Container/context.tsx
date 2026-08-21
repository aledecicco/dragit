import {
  createContext,
  type PropsWithChildren,
  type RefObject,
  useContext,
} from 'react'

interface FileViewerContextValue {
  /**
   * The scrollable element of the file viewer, that contents virtualize against.
   */
  scrollElement: RefObject<HTMLDivElement | null>
}

const FileViewerContext = createContext<FileViewerContextValue | null>(null)

interface FileViewerContextProviderProps extends PropsWithChildren {
  /**
   * The scrollable element of the file viewer.
   */
  scrollElement: RefObject<HTMLDivElement | null>
}

const FileViewerContextProvider = (props: FileViewerContextProviderProps) => {
  const { scrollElement, children } = props

  return (
    <FileViewerContext.Provider value={{ scrollElement }}>
      {children}
    </FileViewerContext.Provider>
  )
}

/**
 * Hook that retrieves the closest file viewer context.
 */
const useFileViewerContext = () => {
  const context = useContext(FileViewerContext)

  if (!context) {
    throw new Error('No file viewer provider found')
  }

  return context
}

export { FileViewerContextProvider, useFileViewerContext }
