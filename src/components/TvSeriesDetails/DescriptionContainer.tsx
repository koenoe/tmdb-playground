import { forwardRef } from 'react';

const TvSeriesDetailsDescriptionContainer = forwardRef<
  HTMLDivElement,
  Readonly<{ children: React.ReactNode }>
>(({ children }, ref) => {
  return (
    <div ref={ref} className="relative w-full xl:w-4/5 2xl:w-3/5">
      {children}
    </div>
  );
});

TvSeriesDetailsDescriptionContainer.displayName =
  'TvSeriesDetailsDescriptionContainer';

export default TvSeriesDetailsDescriptionContainer;
