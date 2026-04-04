import {
  type QueryFunctionContext,
  queryOptions,
  skipToken,
  useQuery,
} from '@tanstack/react-query'
import { fetch } from '@tauri-apps/plugin-http'
import { match } from 'ts-pattern'

import { MS_IN_MINUTE } from '@/utils/time'

import type { RepositoryHost } from '../models'

interface ProfilePictureData {
  url: string
}

const profilePictureQueryKeys = {
  all: {
    key: 'profile_picture',
  } as const,
  user: (username: string | undefined, source: RepositoryHost | undefined) =>
    ({
      ...profilePictureQueryKeys.all,
      username,
      source,
    }) as const,
}

const fetchProfilePicture = (
  username: string,
  source: RepositoryHost,
  context: QueryFunctionContext,
): Promise<ProfilePictureData> => {
  return match(source)
    .with('github', async () => {
      const res = await fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(`${username} in:name`)}`,
        {
          signal: context.signal,
        },
      )

      const url = (await res.json())?.items?.at(0)?.avatar_url

      if (typeof url !== 'string') {
        throw new Error('Profile picture not found')
      }

      return { url }
    })
    .exhaustive()
}

const profilePictureQuery = (
  username: string | undefined,
  source: RepositoryHost | undefined,
) =>
  queryOptions({
    queryKey: [profilePictureQueryKeys.user(username, source)],
    queryFn:
      username && source
        ? (context) => fetchProfilePicture(username, source, context)
        : skipToken,
    enabled: !!username && !!source,
    networkMode: 'online',
    gcTime: 1 * MS_IN_MINUTE,
  })

const useQueryProfilePicture = (
  username: string | undefined,
  source: RepositoryHost | undefined,
) => {
  return useQuery(profilePictureQuery(username, source))
}

export { profilePictureQueryKeys, useQueryProfilePicture }
