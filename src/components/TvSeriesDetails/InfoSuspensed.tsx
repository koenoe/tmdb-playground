import { Suspense } from 'react';

import { type TvSeries } from '@/types/tv-series';

import ContentRating from '../ContentRating/ContentRating';
import WatchProvider from '../WatchProvider/WatchProvider';

export default function TvSeriesDetailsInfoSuspensed({
  tvSeries,
}: Readonly<{ tvSeries: TvSeries }>) {
  return (
    <div className="ml-auto flex h-7 gap-2 md:ml-8">
      <Suspense
        fallback={
          <div className="flex h-7 min-w-7 animate-pulse rounded-sm bg-white/30" />
        }
      >
        <ContentRating id={tvSeries.id} />
      </Suspense>
      <Suspense
        fallback={
          <div className="flex h-7 min-w-7 animate-pulse rounded bg-white/30" />
        }
      >
        <WatchProvider id={tvSeries.id} />
      </Suspense>
    </div>
  );
}
