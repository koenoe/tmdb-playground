import { Suspense } from 'react';

import { notFound, redirect } from 'next/navigation';

import Cast from '@/components/Cast/Cast';
import ExpandableText from '@/components/ExpandableText/ExpandableText';
import EpisodesList from '@/components/List/EpisodesList';
import RecommendationsList from '@/components/List/RecommendationsList';
import SimilarList from '@/components/List/SimilarList';
import Page from '@/components/Page/Page';
import SkeletonAvatars from '@/components/Skeletons/SkeletonAvatars';
import SkeletonList from '@/components/Skeletons/SkeletonList';
import TvSeriesDetailsContainer from '@/components/TvSeriesDetails/Container';
import TvSeriesDetailsCreatedBy from '@/components/TvSeriesDetails/CreatedBy';
import TvSeriesDetailsDescriptionContainer from '@/components/TvSeriesDetails/DescriptionContainer';
import TvSeriesDetailsInfo from '@/components/TvSeriesDetails/Info';
import TvSeriesDetailsInfoContainer from '@/components/TvSeriesDetails/InfoContainer';
import TvSeriesDetailsInfoSuspensed from '@/components/TvSeriesDetails/InfoSuspensed';
import TitleTreatment from '@/components/TvSeriesDetails/TitleTreatment';
import { fetchTvSeries } from '@/lib/tmdb';

type Props = Readonly<{
  params: { id: string; slug: string };
}>;

export async function generateMetadata({ params }: Props) {
  const tvSeries = await fetchTvSeries(params.id);

  if (!tvSeries || tvSeries.isAdult) {
    return notFound();
  }

  if (tvSeries.slug !== params.slug) {
    return redirect(`/tv/${params.id}/${tvSeries.slug}`);
  }

  return {
    title: tvSeries.title,
    description: tvSeries.description,
    alternates: {
      // TODO: does this need to be absolute?
      canonical: `/tv/${params.id}/${tvSeries.slug}`,
    },
  };
}

export default async function TvSeriesDetailsPage({ params }: Props) {
  const tvSeries = await fetchTvSeries(params.id);

  if (!tvSeries || tvSeries.isAdult) {
    return notFound();
  }

  if (tvSeries.slug !== params.slug) {
    return redirect(`/tv/${params.id}/${tvSeries.slug}`);
  }

  return (
    <Page
      backgroundColor={tvSeries.backdropColor}
      backgroundImage={tvSeries.backdropImage}
    >
      <TvSeriesDetailsContainer>
        <TvSeriesDetailsInfoContainer>
          <TitleTreatment tvSeries={tvSeries} className="mb-6" />
          <TvSeriesDetailsInfo tvSeries={tvSeries} className="mb-6">
            <TvSeriesDetailsInfoSuspensed tvSeries={tvSeries} />
          </TvSeriesDetailsInfo>
        </TvSeriesDetailsInfoContainer>

        <TvSeriesDetailsDescriptionContainer>
          <ExpandableText className="mb-6">
            {tvSeries.description}
          </ExpandableText>
          <TvSeriesDetailsCreatedBy tvSeries={tvSeries} />
        </TvSeriesDetailsDescriptionContainer>

        <Suspense
          fallback={
            <SkeletonAvatars className="my-14 w-full lg:mb-7 lg:mt-14 xl:w-4/5 2xl:w-3/5" />
          }
        >
          <Cast
            className="my-14 w-full lg:mb-7 lg:mt-14 xl:w-4/5 2xl:w-3/5"
            id={tvSeries.id}
          />
        </Suspense>
      </TvSeriesDetailsContainer>

      {tvSeries.numberOfEpisodes > 0 && (
        <EpisodesList className="mb-10 md:mb-16" item={tvSeries} />
      )}

      <Suspense fallback={<SkeletonList className="mb-10 md:mb-16" />}>
        <RecommendationsList id={tvSeries.id} className="mb-10 md:mb-16" />
      </Suspense>

      <Suspense fallback={<SkeletonList />}>
        <SimilarList id={tvSeries.id} />
      </Suspense>
    </Page>
  );
}
