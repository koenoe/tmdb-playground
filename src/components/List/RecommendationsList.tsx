import { fetchTvSeriesRecommendations } from '@/lib/tmdb';

import List, { type HeaderVariantProps } from './List';
import Poster from '../Tiles/Poster';

export default async function RecommendationsList({
  id,
  replace,
  ...rest
}: Omit<React.AllHTMLAttributes<HTMLDivElement>, 'id'> &
  HeaderVariantProps &
  Readonly<{
    id: number | string;
    replace?: boolean;
  }>) {
  const tvSeries = await fetchTvSeriesRecommendations(id);

  return tvSeries.length > 0 ? (
    <List title="Recommendations" {...rest}>
      {tvSeries.map((item) => (
        <Poster key={item.id} item={item} replace={replace} />
      ))}
    </List>
  ) : null;
}
