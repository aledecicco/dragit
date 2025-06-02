import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
  useQuery,
} from '@tanstack/react-query'
import { fetch } from '@tauri-apps/plugin-http'

import { MS_IN_MINUTE } from '@utils/time'

const githubProfilePictureQueryKeys = {
  all: {
    key: 'github_profile_picture',
  } as const,
  user: (username: string | undefined) =>
    ({
      ...githubProfilePictureQueryKeys.all,
      username: username,
    }) as const,
}

const fetchGithubProfilePicture = async (
  username: string,
  context: QueryFunctionContext,
): Promise<string | null> => {
  const res = await fetch(
    `https://api.github.com/search/users?q=${encodeURIComponent(`${username} in:name`)}`,
    {
      signal: context.signal,
    },
  )

  return (await res.json())?.items?.at(0)?.avatar_url ?? null
}

const githubProfilePictureQuery = (username: string | undefined) =>
  queryOptions({
    queryKey: [githubProfilePictureQueryKeys.user(username)],
    queryFn: username
      ? (context) => fetchGithubProfilePicture(username, context)
      : skipToken,
    enabled: !!username,
    networkMode: 'online',
    gcTime: 1 * MS_IN_MINUTE,
  })

const useQueryGithubProfilePicture = (username: string | undefined) => {
  return useQuery(githubProfilePictureQuery(username))
}

export { githubProfilePictureQueryKeys, useQueryGithubProfilePicture }
