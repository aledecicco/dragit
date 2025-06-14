import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
  useQuery,
} from '@tanstack/react-query'
import { fetch } from '@tauri-apps/plugin-http'
import { match } from 'ts-pattern'

import { MS_IN_MINUTE } from '@/utils/time'

import type { ProfilePictureSource } from '../models'

const profilePictureQueryKeys = {
  all: {
    key: 'profile_picture',
  } as const,
  user: (username: string | undefined, source: ProfilePictureSource) =>
    ({
      ...profilePictureQueryKeys.all,
      username,
      source,
    }) as const,
}

const fetchProfilePicture = (
  username: string,
  source: ProfilePictureSource,
  context: QueryFunctionContext,
): Promise<string | null> => {
  return match(source)
    .with('github', async () => {
      const res = await fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(`${username} in:name`)}`,
        {
          signal: context.signal,
        },
      )

      return (await res.json())?.items?.at(0)?.avatar_url ?? null
    })
    .exhaustive()
}

const profilePictureQuery = (
  username: string | undefined,
  source: ProfilePictureSource,
) =>
  queryOptions({
    queryKey: [profilePictureQueryKeys.user(username, source)],
    queryFn: username
      ? (context) => fetchProfilePicture(username, source, context)
      : skipToken,
    enabled: !!username,
    networkMode: 'online',
    gcTime: 1 * MS_IN_MINUTE,
  })

const useQueryProfilePicture = (
  username: string | undefined,
  source: ProfilePictureSource,
) => {
  return useQuery(profilePictureQuery(username, source))
}

export { profilePictureQueryKeys, useQueryProfilePicture }
