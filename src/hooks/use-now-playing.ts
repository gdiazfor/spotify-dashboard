import { useQuery } from "@tanstack/react-query";
import { useSpotify } from "./use-spotify";

export function useNowPlaying() {
  const spotify = useSpotify();

  return useQuery({
    queryKey: ["now-playing"],
    queryFn: async () => {
      const response = await spotify.fetchWithToken('/me/player/currently-playing')
      if (!response) return null
      
      // Get the first artist's info
      const artistId = response.item.artists[0].id
      const artistData = await spotify.fetchWithToken(`/artists/${artistId}`)
      
      return {
        ...response,
        artistData
      }
    },
    refetchInterval: 10000,
  });
} 