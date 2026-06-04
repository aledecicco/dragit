import { queryOptions, useQuery } from '@tanstack/react-query'
import { getName, getVersion } from '@tauri-apps/api/app'

interface AppInfo {
  name: string
  version: string
}

const appInfoQueryKey = { key: 'app_info' } as const

const fetchAppInfo = async (): Promise<AppInfo> => {
  const [name, version] = await Promise.all([getName(), getVersion()])

  return { name, version }
}

const appInfoQuery = queryOptions({
  queryKey: [appInfoQueryKey],
  queryFn: fetchAppInfo,
})

const useQueryAppInfo = () => useQuery(appInfoQuery)

export { appInfoQuery, appInfoQueryKey, useQueryAppInfo }
