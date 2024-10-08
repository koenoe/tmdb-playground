import 'server-only';

type MediaType = 'movie' | 'show';

type Item = Readonly<{
  id: number; // tmdb id
  title: string;
  mediaType: MediaType;
}>;

async function mdblistFetch(path: RequestInfo | URL, init?: RequestInit) {
  const headers = {
    accept: 'application/json',
  };
  const next = {
    revalidate: 3600,
  };
  const patchedOptions = {
    ...init,
    next: {
      ...next,
      ...(init?.next || {}),
    },
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  };

  const urlWithParams = new URL(`https://mdblist.com${path}`);
  urlWithParams.searchParams.set(
    'apikey',
    process.env.MDBLIST_API_KEY as string,
  );

  const response = await fetch(urlWithParams.toString(), patchedOptions);

  if (!response.ok) {
    throw new Error(`HTTP error status: ${response.status}`);
  }

  const json = await response.json();
  return json;
}

export async function fetchTvSeriesOrMovie(
  id: number | string,
  mediaType: MediaType = 'show',
) {
  const response = (await mdblistFetch(`/api?tm=${id}&m=${mediaType}`)) as {
    description: string;
    imdbid: string;
    ratings: Array<{
      popular: number;
      score: number;
      source: string;
      value: number;
      votes: number;
    }>;
    released: string;
    released_digital: string | null;
    runtime: number;
    score: number;
    score_average: number;
    title: string;
    tmdbid: number;
    traktid: number;
    type: string;
    year: number;
  };

  return response;
}

export async function fetchRating(
  id: number | string,
  mediaType: MediaType = 'show',
  returnRating: string = 'imdb',
) {
  const response = await fetchTvSeriesOrMovie(id, mediaType);
  const rating = response.ratings?.find(
    (rating) => rating.source === returnRating,
  );

  return rating && rating.value > 0
    ? {
        ...rating,
        imdbid: response.imdbid,
      }
    : null;
}

export async function fetchImdbTopRatedTvSeries() {
  const response = (await mdblistFetch(
    '/lists/koenoe/imdb-top-rated-by-koen/json',
  )) as Item[];

  return response.map((item) => item.id);
}

export async function fetchKoreasFinest() {
  const response = (await mdblistFetch(
    '/lists/koenoe/top-rated-korean-shows-on-netflix/json',
  )) as Item[];

  return response.map((item) => item.id);
}
