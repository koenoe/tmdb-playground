import { forwardRef } from 'react';

import { type TvSeries } from '@/types/tv-series';

const CreatedBy = forwardRef<
  HTMLParagraphElement,
  Readonly<{ tvSeries: TvSeries }>
>(({ tvSeries }, ref) => {
  return tvSeries.createdBy.length > 0 ? (
    <p ref={ref} className="inline-flex gap-3 text-sm leading-loose">
      <span className="opacity-60">Created by:</span>
      {/* TODO: <Link /> to person pages */}
      {tvSeries.createdBy.map((creator) => creator.name).join(', ')}
    </p>
  ) : null;
});

CreatedBy.displayName = 'CreatedBy';

export default CreatedBy;
