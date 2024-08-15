import { forwardRef } from 'react';

import { cx } from 'class-variance-authority';

import { type TvSeries } from '@/types/tv-series';

const TvSeriesDetailsInfo = forwardRef<
  HTMLHeadingElement,
  Readonly<{
    tvSeries: TvSeries;
    className?: string;
    children?: React.ReactNode;
  }>
>(({ className, children, tvSeries }, ref) => {
  return (
    <div ref={ref} className={cx('flex w-full gap-4 md:gap-12', className)}>
      <div className="flex w-full items-center gap-1 whitespace-nowrap text-xs md:gap-2 md:text-[0.8rem]">
        <div className="opacity-60">{tvSeries.releaseYear}</div>
        <div className="opacity-60 before:mr-1 before:content-['·'] md:before:mr-2">
          {tvSeries.numberOfSeasons}{' '}
          {tvSeries.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
        </div>
        {tvSeries.genres.length > 0 && (
          <>
            {/* TODO: <Link /> to genre pages */}
            <div className="hidden opacity-60 before:mr-1 before:content-['·'] md:block md:before:mr-2">
              {tvSeries.genres.map((genre) => genre.name).join(', ')}
            </div>
            <div className="opacity-60 before:mr-1 before:content-['·'] md:hidden md:before:mr-2">
              {tvSeries.genres?.[0].name}
            </div>
          </>
        )}
        {children}
      </div>
    </div>
  );
});

TvSeriesDetailsInfo.displayName = 'TvSeriesDetailsInfo';

export default TvSeriesDetailsInfo;
