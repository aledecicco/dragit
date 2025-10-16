import { useEffectOnce } from 'react-use'

/**
 * Hook that prevents the default context menu from appearing on right-click.
 */
export const useContextMenuHandler = () => {
  useEffectOnce(() => {
    window.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })
  })
}
