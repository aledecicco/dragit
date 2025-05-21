import { queryOptions, skipToken, useQuery } from '@tanstack/react-query'
import { fetch } from '@tauri-apps/plugin-http'

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
): Promise<string | null> => {
  const res = await fetch(
    `https://api.github.com/search/users?q=${encodeURIComponent(`${username} in:name`)}`,
  )

  return (await res.json())?.items?.at(0)?.avatar_url ?? null
}

const githubProfilePictureQuery = (username: string | undefined) =>
  queryOptions({
    queryKey: [githubProfilePictureQueryKeys.user(username)],
    queryFn: username ? () => fetchGithubProfilePicture(username) : skipToken,
    enabled: !!username,
  })

const useQueryGithubProfilePicture = (username: string | undefined) => {
  return useQuery(githubProfilePictureQuery(username))
}

export { githubProfilePictureQueryKeys, useQueryGithubProfilePicture }
