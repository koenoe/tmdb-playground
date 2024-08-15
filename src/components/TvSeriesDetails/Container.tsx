import { forwardRef } from 'react';

const TvSeriesDetailsContainer = forwardRef<
  HTMLDivElement,
  Readonly<{ children: React.ReactNode }>
>(({ children }, ref) => {
  return (
    <div ref={ref} className="container">
      {children}
    </div>
  );
});

TvSeriesDetailsContainer.displayName = 'TvSeriesDetailsContainer';

export default TvSeriesDetailsContainer;
