import 'server-only';

import slugify from 'slugify';

import { type Account } from '@/types/account';
import { type CountryOrLanguage } from '@/types/country-language';
import { type Genre } from '@/types/genre';
import { type Movie } from '@/types/movie';
import { type Person } from '@/types/person';
import type {
  Season,
  TvSeries,
  TvSeriesAccountStates,
} from '@/types/tv-series';
import { type WatchProvider } from '@/types/watch-provider';
import getBaseUrl from '@/utils/getBaseUrl';
import { toQueryString } from '@/utils/toQueryString';

import {
  generateTmdbImageUrl,
  normalizeTvSeries,
  type TmdbTvSeries,
  type TmdbTrendingTvSeries,
  type TmdbDiscoverTvSeries,
  type TmdbGenresForTvSeries,
  type TmdbTvSeriesContentRatings,
  type TmdbTvSeriesWatchProviders,
  type TmdbTvSeriesRecommendations,
  type TmdbTvSeriesSimilar,
  type TmdbTvSeriesCredits,
  normalizePersons,
  type TmdbTvSeriesSeason,
  type TmdbSearchTvSeries,
  type TmdbAccountDetails,
  type TmdbTvSeriesAccountStates,
  type TmdbWatchlist,
  type TmdbFavorites,
  type TmdbWatchProviders,
  type TmdbKeywords,
  type TmdbCountries,
  type TmdbLanguages,
  type TmdbKeyword,
  type TmdbPerson,
  normalizeMovie,
  type TmdbMovie,
  type TmdbDiscoverTvSeriesQuery,
  type TmdbDiscoverMovieQuery,
  type TmdbDiscoverMovies,
  GLOBAL_GENRES_TO_IGNORE,
  buildDiscoverQuery,
  type TmdbSearchPerson,
  type TmdbPersonTvCredits,
} from './helpers';
import detectDominantColorFromImage from '../detectDominantColorFromImage';
import { fetchImdbTopRatedTvSeries, fetchKoreasFinest } from '../mdblist';

async function tmdbFetch(path: RequestInfo | URL, init?: RequestInit) {
  const pathAsString = path.toString();
  const urlWithParams = new URL(`https://api.themoviedb.org${pathAsString}`);

  if (pathAsString.startsWith('/3/')) {
    urlWithParams.searchParams.set(
      'api_key',
      process.env.TMDB_API_KEY as string,
    );
  }

  const headers = {
    'content-type': 'application/json',
    ...(pathAsString.startsWith('/4/') && {
      Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
    }),
  };

  // Note: NextJS doesn't allow both revalidate + cache headers
  const next = init?.cache
    ? {}
    : {
        revalidate: 3600,
      };

  const patchedOptions = {
    ...init,
    next: {
      ...next,
      ...init?.next,
    },
    headers: {
      ...headers,
      ...init?.headers,
    },
  };

  const response = await fetch(urlWithParams.toString(), patchedOptions);

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`HTTP error status: ${response.status}`);
  }

  const json = await response.json();

  return json;
}

export async function createRequestToken(redirectUri: string = getBaseUrl()) {
  const response = (await tmdbFetch('/4/auth/request_token', {
    cache: 'no-store',
    method: 'POST',
    body: JSON.stringify({
      redirect_to: redirectUri,
    }),
  })) as Readonly<{
    success: boolean;
    status_code: number;
    status_message: string;
    request_token: string;
  }>;

  return response.request_token;
}

export async function createAccessToken(requestToken: string) {
  const response = (await tmdbFetch('/4/auth/access_token', {
    cache: 'no-store',
    method: 'POST',
    body: JSON.stringify({
      request_token: requestToken,
    }),
  })) as Readonly<{
    success: boolean;
    status_code: number;
    status_message: string;
    account_id: string;
    access_token: string;
  }>;

  return {
    accountObjectId: response.account_id,
    accessToken: response.access_token,
  };
}

export async function createSessionId(accessToken: string) {
  const response = (await tmdbFetch('/3/authentication/session/convert/4', {
    cache: 'no-store',
    method: 'POST',
    body: JSON.stringify({
      access_token: accessToken,
    }),
  })) as Readonly<{
    success: boolean;
    session_id: string;
  }>;

  return response.session_id;
}

export async function deleteSessionId(sessionId: string) {
  await tmdbFetch('/3/authentication/session', {
    cache: 'no-store',
    method: 'DELETE',
    body: JSON.stringify({
      session_id: sessionId,
    }),
  });
}

export async function deleteAccessToken(accessToken: string) {
  await tmdbFetch('/4/auth/access_token', {
    cache: 'no-store',
    method: 'DELETE',
    body: JSON.stringify({
      access_token: accessToken,
    }),
  });
}

export async function fetchAccountDetails(sessionId: string) {
  const response = (await tmdbFetch(
    `/3/account?session_id=${sessionId}`,
  )) as TmdbAccountDetails;

  return {
    id: response.id,
    name: response.name,
    username: response.username,
    avatar: response.avatar?.gravatar
      ? `https://www.gravatar.com/avatar/${response.avatar.gravatar.hash}`
      : undefined,
  } as Account;
}

type ToggleArgs = Readonly<{
  id: number | string;
  accountId: number | string;
  sessionId: string;
  value: boolean;
}>;

export async function addToOrRemoveFromWatchlist({
  id,
  accountId,
  sessionId,
  value,
}: ToggleArgs) {
  await tmdbFetch(`/3/account/${accountId}/watchlist?session_id=${sessionId}`, {
    cache: 'no-store',
    method: 'POST',
    body: JSON.stringify({
      media_type: 'tv',
      media_id: id,
      watchlist: value,
    }),
  });
}

export async function addToOrRemoveFromFavorites({
  id,
  accountId,
  sessionId,
  value,
}: ToggleArgs) {
  await tmdbFetch(`/3/account/${accountId}/favorite?session_id=${sessionId}`, {
    cache: 'no-store',
    method: 'POST',
    body: JSON.stringify({
      media_type: 'tv',
      media_id: id,
      favorite: value,
    }),
  });
}

export async function fetchWatchlist({
  accountId,
  sessionId,
  page = 1,
}: Readonly<{
  accountId: number | string;
  sessionId: string;
  page?: number;
}>) {
  const response = (await tmdbFetch(
    `/3/account/${accountId}/watchlist/tv?session_id=${sessionId}&sort_by=created_at.desc&page=${page}`,
    {
      cache: 'no-store',
    },
  )) as TmdbWatchlist;

  const items = (response.results ?? []).map((series) => {
    return normalizeTvSeries(series as TmdbTvSeries);
  });

  return {
    items,
    totalNumberOfPages: response.total_pages,
    totalNumberOfItems: response.total_results,
  };
}

export async function fetchFavorites({
  accountId,
  sessionId,
  page = 1,
}: Readonly<{
  accountId: number | string;
  sessionId: string;
  page?: number;
}>) {
  const response = (await tmdbFetch(
    `/3/account/${accountId}/favorite/tv?session_id=${sessionId}&sort_by=created_at.desc&page=${page}`,
    {
      cache: 'no-store',
    },
  )) as TmdbFavorites;

  const items = (response.results ?? []).map((series) => {
    return normalizeTvSeries(series as TmdbTvSeries);
  });

  return {
    items,
    totalNumberOfPages: response.total_pages,
    totalNumberOfItems: response.total_results,
  };
}

export async function fetchAllFavorites({
  accountId,
  sessionId,
  maxNumberOfItems,
}: Readonly<{
  accountId: number | string;
  sessionId: string;
  maxNumberOfItems?: number;
}>) {
  const allItems: TvSeries[] = [];
  let currentPage = 1;
  let totalNumberOfItems: number;

  do {
    const { items, totalNumberOfItems: total } = await fetchFavorites({
      accountId,
      sessionId,
      page: currentPage,
    });
    totalNumberOfItems = total;
    allItems.push(...items);
    currentPage++;
  } while (
    allItems.length < totalNumberOfItems &&
    (!maxNumberOfItems || allItems.length < maxNumberOfItems)
  );

  return allItems;
}

export async function fetchRecommendedTvSeries({
  accountObjectId,
  accessToken,
  page = 1,
}: Readonly<{
  accountObjectId: string;
  accessToken: string;
  page?: number;
}>) {
  const response = (await tmdbFetch(
    `/4/account/${accountObjectId}/tv/recommendations?page=${page}`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )) as TmdbFavorites; // TODO: sort out type, but it's the same as `favorites/watchlist`

  const items = (response.results ?? []).map((series) => {
    return normalizeTvSeries(series as TmdbTvSeries);
  });

  return {
    items,
    totalNumberOfPages: response.total_pages,
    totalNumberOfItems: response.total_results,
  };
}

export async function fetchRecommendedForYou({
  accountId,
  sessionId,
  accountObjectId,
  accessToken,
  minNumberOfItems = 25,
}: Readonly<{
  accountId: number | string;
  sessionId: string;
  accountObjectId: string;
  accessToken: string;
  minNumberOfItems?: number;
}>) {
  const favorites = await fetchAllFavorites({
    accountId,
    sessionId,
    maxNumberOfItems: 1000,
  });

  const favoriteIds = new Set(favorites.map((fav) => fav.id));

  const recommendations: TvSeries[] = [];
  let page = 1;

  while (recommendations.length < minNumberOfItems) {
    const { items, totalNumberOfPages } = await fetchRecommendedTvSeries({
      accountObjectId,
      accessToken,
      page,
    });

    const newRecommendations = items.filter(
      (item) => !favoriteIds.has(item.id),
    );
    recommendations.push(...newRecommendations);

    if (page >= totalNumberOfPages) {
      break;
    }

    page++;
  }

  return recommendations;
}

export async function fetchTvSeries(
  id: number | string,
): Promise<TvSeries | undefined> {
  const series = (await tmdbFetch(
    `/3/tv/${id}?append_to_response=images&include_image_language=en,null`,
  )) as TmdbTvSeries;

  if (!series) {
    return undefined;
  }

  const normalizedTvSeries = normalizeTvSeries(series);

  if (normalizedTvSeries.backdropImage) {
    const backdropColor = await detectDominantColorFromImage(
      normalizedTvSeries.backdropImage.replace(
        'w1920_and_h1080_multi_faces',
        'w1280_and_h720_multi_faces',
      ),
    );

    return {
      ...normalizedTvSeries,
      backdropColor,
      seasons: series.seasons
        ?.filter((season) => season.episode_count > 0)
        .map((season) => ({
          id: season.id,
          title: season.name as string,
          description: season.overview ?? '',
          airDate: season.air_date
            ? new Date(season.air_date).toISOString()
            : '',
          seasonNumber: season.season_number,
          episodeCount: season.episode_count,
          episodes: [],
        })),
    };
  }

  return normalizedTvSeries;
}

export async function fetchTvSeriesAccountStates(
  id: number | string,
  sessionId: string,
): Promise<TvSeriesAccountStates> {
  const series = (await tmdbFetch(
    `/3/tv/${id}/account_states?session_id=${sessionId}`,
    {
      cache: 'no-store',
    },
  )) as TmdbTvSeriesAccountStates;

  if (!series) {
    return {
      isFavorited: false,
      isWatchlisted: false,
    };
  }

  return {
    isFavorited: series.favorite,
    isWatchlisted: series.watchlist,
  };
}

export async function fetchTvSeriesContentRating(
  id: number | string,
  region = 'US',
): Promise<string | undefined> {
  const contentRatings = (await tmdbFetch(
    `/3/tv/${id}/content_ratings`,
  )) as TmdbTvSeriesContentRatings;

  return contentRatings.results?.find((rating) => rating.iso_3166_1 === region)
    ?.rating;
}

export async function fetchTvSeriesWatchProviders(
  id: number | string,
  region = 'US',
): Promise<WatchProvider[]> {
  const watchProviders = (await tmdbFetch(
    `/3/tv/${id}/watch/providers`,
  )) as TmdbTvSeriesWatchProviders;

  return (
    watchProviders.results?.[region as keyof typeof watchProviders.results]
      ?.flatrate ?? []
  )
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name as string,
      logo: provider.logo_path
        ? generateTmdbImageUrl(provider.logo_path, 'w92')
        : '',
    }));
}

export async function fetchTvSeriesCredits(
  id: number | string,
): Promise<Readonly<{ cast: Person[]; crew: Person[] }>> {
  const credits = (await tmdbFetch(
    `/3/tv/${id}/aggregate_credits`,
  )) as TmdbTvSeriesCredits;

  const cast = credits.cast?.sort((a, b) => a.order - b.order) ?? [];

  return {
    cast: normalizePersons(cast),
    crew: normalizePersons(credits.crew),
  };
}

export async function fetchTvSeriesRecommendations(
  id: number | string,
): Promise<TvSeries[]> {
  const response = (await tmdbFetch(
    `/3/tv/${id}/recommendations`,
  )) as TmdbTvSeriesRecommendations;

  return (response.results ?? [])
    .filter((series) => !!series.poster_path)
    .map((series) => {
      return normalizeTvSeries(series as TmdbTvSeries);
    });
}

export async function fetchTvSeriesSimilar(
  id: number | string,
): Promise<TvSeries[]> {
  const response = (await tmdbFetch(
    `/3/tv/${id}/similar`,
  )) as TmdbTvSeriesSimilar;

  return (response.results ?? [])
    .filter((series) => !!series.poster_path)
    .map((series) => {
      return normalizeTvSeries(series as TmdbTvSeries);
    });
}

export async function fetchTvSeriesSeason(
  id: number | string,
  season: number | string,
): Promise<Season> {
  const response = (await tmdbFetch(
    `/3/tv/${id}/season/${season}`,
  )) as TmdbTvSeriesSeason;

  const episodes = (response.episodes ?? []).map((episode) => ({
    id: episode.id,
    title: episode.name ?? '',
    description: episode.overview ?? '',
    episodeNumber: episode.episode_number,
    seasonNumber: episode.season_number,
    airDate: episode.air_date ? new Date(episode.air_date).toISOString() : '',
    runtime: episode.runtime,
    stillImage: episode.still_path
      ? generateTmdbImageUrl(episode.still_path, 'w454_and_h254_bestv2')
      : '',
  }));

  return {
    id: response.id,
    title: response.name as string,
    description: response.overview ?? '',
    airDate: response.air_date ? new Date(response.air_date).toISOString() : '',
    seasonNumber: response.season_number,
    episodes,
  };
}

export async function fetchTrendingTvSeries() {
  const trendingTvSeriesResponse =
    ((await tmdbFetch('/3/trending/tv/day')) as TmdbTrendingTvSeries) ?? [];

  const ids = (trendingTvSeriesResponse.results ?? [])
    .filter(
      (series) =>
        series.vote_count > 0 &&
        !series.genre_ids?.some((genre) =>
          [...GLOBAL_GENRES_TO_IGNORE, 16, 10762].includes(genre),
        ),
    )
    .map((series) => series.id)
    .slice(0, 10);

  const series = await Promise.all(
    ids.map(async (id) => {
      const serie = await fetchTvSeries(id);
      return serie as TvSeries;
    }),
  );

  return series;
}

export async function fetchTopRatedTvSeries() {
  const topRatedIds = await fetchImdbTopRatedTvSeries();
  const series = await Promise.all(
    topRatedIds.map(async (id) => {
      const serie = await fetchTvSeries(id);
      return serie as TvSeries;
    }),
  );
  return series;
}

export async function fetchDiscoverTvSeries(query?: TmdbDiscoverTvSeriesQuery) {
  const queryString = toQueryString(buildDiscoverQuery(query));

  const response =
    ((await tmdbFetch(
      `/3/discover/tv${queryString}`,
    )) as TmdbDiscoverTvSeries) ?? [];

  const items = (response.results ?? []).map((series) =>
    normalizeTvSeries(series as TmdbTvSeries),
  );

  return {
    items,
    totalNumberOfPages: response.total_pages,
    totalNumberOfItems: response.total_results,
    queryString: query ? toQueryString(query) : '',
  };
}

export async function fetchDiscoverMovies(query?: TmdbDiscoverMovieQuery) {
  const queryString = toQueryString(buildDiscoverQuery(query));

  const response =
    ((await tmdbFetch(
      `/3/discover/movie${queryString}`,
    )) as TmdbDiscoverMovies) ?? [];

  const items = (response.results ?? []).map((item) =>
    normalizeMovie(item as TmdbMovie),
  );

  return {
    items,
    totalNumberOfPages: response.total_pages,
    totalNumberOfItems: response.total_results,
    queryString: query ? toQueryString(query) : '',
  };
}

export async function fetchPopularBritishCrimeTvSeries() {
  const { items } = await fetchDiscoverTvSeries({
    language: 'en-GB',
    sort_by: 'popularity.desc',
    'vote_count.gte': 250,
    watch_region: 'GB',
    with_genres: '80',
    without_genres: '10766',
    with_origin_country: 'GB',
    with_original_language: 'en',
  });
  return items.filter((item) => !!item.posterImage && !!item.backdropImage);
}

export async function fetchBestSportsDocumentariesTvSeries() {
  const { items } = await fetchDiscoverTvSeries({
    sort_by: 'vote_average.desc',
    'vote_count.gte': 7,
    with_genres: '99',
    without_genres: '35',
    with_keywords: '6075|2702',
    without_keywords: '10596,293434,288928,11672',
  });
  return items.filter((item) => !!item.posterImage && !!item.backdropImage);
}

export async function fetchApplePlusTvSeries(region = 'US') {
  const { items } = await fetchDiscoverTvSeries({
    sort_by: 'vote_average.desc',
    'vote_count.gte': 250,
    without_genres: '99',
    watch_region: region,
    with_watch_providers: '350',
  });
  return items;
}

export async function fetchMostAnticipatedTvSeries() {
  const withoutGenres = [...GLOBAL_GENRES_TO_IGNORE, 16, 10762];
  const { items } = await fetchDiscoverTvSeries({
    without_genres: withoutGenres.join(','),
    'first_air_date.gte': new Date().toISOString().split('T')[0],
    'vote_count.gte': 0,
  });

  return items.filter(
    (item) =>
      !!item.posterImage &&
      !!item.backdropImage &&
      // Note: somehow we still get some series with genres we want to ignore ¯\_(ツ)_/¯
      !item.genres?.some((genre) => withoutGenres.includes(genre.id)) &&
      item.id !== 131835,
  );
}

export async function fetchGenresForTvSeries() {
  const genresResponse =
    ((await tmdbFetch('/3/genre/tv/list')) as TmdbGenresForTvSeries) ?? [];

  return (genresResponse.genres ?? []).filter(
    (genre) => !GLOBAL_GENRES_TO_IGNORE.includes(genre.id),
  ) as Genre[];
}

export async function searchTvSeries(query: string) {
  const tvSeriesResponse =
    ((await tmdbFetch(
      `/3/search/tv?include_adult=false&page=1&query=${query}`,
    )) as TmdbSearchTvSeries) ?? [];

  return (tvSeriesResponse.results ?? [])
    .filter((series) => !!series.poster_path)
    .map((series) => {
      return normalizeTvSeries(series as TmdbTvSeries);
    });
}

export async function fetchKoreasFinestTvSeries() {
  const ids = await fetchKoreasFinest();
  const series = await Promise.all(
    ids.map(async (id) => {
      const serie = await fetchTvSeries(id);
      return serie as TvSeries;
    }),
  );
  return series;
}

export async function fetchWatchProviders(
  region = 'US',
): Promise<WatchProvider[]> {
  const watchProviders = (await tmdbFetch(
    `/3/watch/providers/tv?watch_region=${region}`,
  )) as TmdbWatchProviders;

  return (watchProviders.results ?? [])
    .sort((a, b) => {
      const sortKey = region as keyof typeof watchProviders.results;
      const priorityA = a.display_priorities?.[sortKey] ?? a.display_priority;
      const priorityB = b.display_priorities?.[sortKey] ?? b.display_priority;
      return priorityA - priorityB;
    })
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name as string,
      logo: provider.logo_path
        ? generateTmdbImageUrl(provider.logo_path, 'w92')
        : '',
    }));
}

export async function fetchCountries() {
  const response =
    ((await tmdbFetch('/3/configuration/countries')) as TmdbCountries) ?? [];

  return (response ?? [])
    .map((country) => {
      return {
        code: String(country.iso_3166_1),
        englishName: String(country.english_name),
        name: String(country.native_name),
      } as CountryOrLanguage;
    })
    .sort((a, b) => {
      const key = a.englishName && b.englishName ? 'englishName' : 'name';
      return a[key].localeCompare(b[key]);
    });
}

export async function fetchLanguages() {
  const response =
    ((await tmdbFetch('/3/configuration/languages')) as TmdbLanguages) ?? [];

  return (response ?? [])
    .map((language) => {
      return {
        code: String(language.iso_639_1),
        englishName: String(language.english_name),
        name: String(language.name),
      } as CountryOrLanguage;
    })
    .sort((a, b) => {
      const key = a.englishName && b.englishName ? 'englishName' : 'name';
      return a[key].localeCompare(b[key]);
    });
}

export async function fetchKeyword(id: number) {
  const response = (await tmdbFetch(`/3/keyword/${id}`)) as TmdbKeyword;
  return response;
}

export async function searchKeywords(query: string) {
  const response =
    ((await tmdbFetch(`/3/search/keyword?query=${query}`)) as TmdbKeywords) ??
    [];

  return (response.results ?? []).map((keyword) => {
    return {
      id: keyword.id,
      name: keyword.name,
    };
  });
}

export async function searchPerson(query: string) {
  const response =
    ((await tmdbFetch(
      `/3/search/person?query=${query}`,
    )) as TmdbSearchPerson) ?? [];

  return (response.results ?? []).map((person) => {
    return {
      id: person.id,
      name: person.name ?? '',
      image: person.profile_path
        ? generateTmdbImageUrl(person.profile_path, 'w600_and_h900_bestv2')
        : '',
      slug: slugify(person.name as string, { lower: true, strict: true }),
      knownForDepartment: person.known_for_department,
      isAdult: person.adult,
      knownFor: (person.known_for ?? []).map((item) => {
        if (item.media_type === 'tv') {
          return normalizeTvSeries(item as unknown as TmdbTvSeries) as TvSeries;
        } else {
          return normalizeMovie(item as TmdbMovie) as Movie;
        }
      }) as ReadonlyArray<TvSeries | Movie>,
    };
  });
}

export async function fetchPerson(id: number | string) {
  const person = (await tmdbFetch(`/3/person/${id}`)) as TmdbPerson;

  return {
    id: person.id,
    name: person.name ?? '',
    image: person.profile_path
      ? generateTmdbImageUrl(person.profile_path, 'w600_and_h900_bestv2')
      : '',
    slug: slugify(person.name as string, { lower: true, strict: true }),
    episodeCount:
      'total_episode_count' in person ? person.total_episode_count : 0,
    birthdate: person.birthday,
    deathdate: person.deathday,
    placeOfBirth: person.place_of_birth,
    biography: person.biography,
    imdbId: person.imdb_id,
    knownForDepartment: person.known_for_department,
    isAdult: person.adult,
  } as Person;
}

export async function fetchPersonKnownFor(
  person: Person,
): Promise<ReadonlyArray<TvSeries | Movie>> {
  const results = await searchPerson(person.name);
  return results[0]?.knownFor ?? [];
}

export async function fetchPersonTvCredits(id: number | string) {
  const credits = (await tmdbFetch(
    `/3/person/${id}/tv_credits`,
  )) as TmdbPersonTvCredits;

  const sortAndGroup = (
    results: TmdbPersonTvCredits['cast'] | TmdbPersonTvCredits['crew'] = [],
  ) => {
    const currentDate = new Date();
    const uniqueResults = [
      ...new Map(results.map((item) => [item.id, item])).values(),
    ];
    const normalizedResults = uniqueResults
      .filter(
        (series) =>
          series.poster_path &&
          series.genre_ids &&
          series.genre_ids.length > 0 &&
          !series.genre_ids.some((genre) =>
            GLOBAL_GENRES_TO_IGNORE.includes(genre),
          ),
      )
      .sort((a, b) => {
        if (!a.first_air_date && !b.first_air_date) return 0;
        if (!a.first_air_date) return -1;
        if (!b.first_air_date) return 1;

        const dateA = new Date(a.first_air_date as string);
        const dateB = new Date(b.first_air_date as string);
        return dateB.getTime() - dateA.getTime();
      })
      .map((series) => normalizeTvSeries(series as unknown as TmdbTvSeries));

    const upcoming = normalizedResults.filter((series) => {
      if (!series.firstAirDate) return true;
      return new Date(series.firstAirDate) > currentDate;
    });
    const previous = normalizedResults.filter((series) => {
      if (!series.firstAirDate) return false;
      return new Date(series.firstAirDate) <= currentDate;
    });

    return { upcoming, previous };
  };

  const cast = sortAndGroup(credits.cast);
  const crew = sortAndGroup(credits.crew);

  return { cast, crew };
}
