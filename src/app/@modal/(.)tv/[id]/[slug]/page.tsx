import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import Cast from '@/components/Cast/Cast';
import ExpandableTextMotion from '@/components/ExpandableText/ExpandableTextMotion';
import EpisodesList from '@/components/List/EpisodesList';
import RecommendationsList from '@/components/List/RecommendationsList';
import SimilarList from '@/components/List/SimilarList';
import MotionDiv from '@/components/MotionDiv';
import PageModalCloseButton from '@/components/Page/PageModalCloseButton';
import PageStoreUpdater from '@/components/Page/PageStoreUpdater';
import SkeletonAvatars from '@/components/Skeletons/SkeletonAvatars';
import SkeletonList from '@/components/Skeletons/SkeletonList';
import TvSeriesDetailsContainer from '@/components/TvSeriesDetails/Container';
import TvSeriesDetailsCreatedByMotion from '@/components/TvSeriesDetails/CreatedByMotion';
import TvSeriesDetailsDescriptionContainer from '@/components/TvSeriesDetails/DescriptionContainer';
import TvSeriesDetailsInfoContainer from '@/components/TvSeriesDetails/InfoContainer';
import TvSeriesDetailsInfoMotion from '@/components/TvSeriesDetails/InfoMotion';
import TvSeriesDetailsInfoSuspensed from '@/components/TvSeriesDetails/InfoSuspensed';
import TitleTreatmentMotion from '@/components/TvSeriesDetails/TitleTreatmentMotion';
import { fetchTvSeries } from '@/lib/tmdb';

type Props = Readonly<{
  params: { id: string; slug: string };
}>;

export async function generateMetadata({ params }: Props) {
  const tvSeries = await fetchTvSeries(params.id);

  if (!tvSeries || tvSeries.isAdult) {
    return notFound();
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

const transition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.2,
};

const variants = {
  hidden: {
    opacity: 0,
    transition,
  },
  show: {
    opacity: 1,
    transition: {
      ...transition,
      staggerChildren: 0.2,
      // Note: duration of background crossfade-ish
      delayChildren: 0.5,
    },
  },
};

const childVariants = {
  hidden: {
    transition,
    opacity: 0,
    y: 75,
  },
  show: {
    transition,
    opacity: 1,
    y: 0,
  },
};

export default async function TvSeriesDetailsModalPage({ params }: Props) {
  const tvSeries = await fetchTvSeries(params.id);

  if (!tvSeries || tvSeries.isAdult) {
    return notFound();
  }

  return (
    <>
      <PageStoreUpdater
        backgroundColor={tvSeries.backdropColor}
        backgroundImage={
          tvSeries.backdropImage ??
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        }
      />
      <MotionDiv variants={variants} layout>
        <div className="absolute z-10 h-[6rem] w-full md:h-[8rem]">
          <div className="container flex h-full w-full items-center justify-between">
            <PageModalCloseButton />
          </div>
        </div>

        <TvSeriesDetailsContainer>
          <TvSeriesDetailsInfoContainer>
            <TitleTreatmentMotion
              tvSeries={tvSeries}
              className="mb-6"
              variants={childVariants}
            />
            <TvSeriesDetailsInfoMotion
              tvSeries={tvSeries}
              className="mb-6"
              variants={childVariants}
            >
              <TvSeriesDetailsInfoSuspensed tvSeries={tvSeries} />
            </TvSeriesDetailsInfoMotion>
          </TvSeriesDetailsInfoContainer>

          <TvSeriesDetailsDescriptionContainer>
            <ExpandableTextMotion className="mb-6" variants={childVariants}>
              {tvSeries.description}
            </ExpandableTextMotion>
            <TvSeriesDetailsCreatedByMotion
              tvSeries={tvSeries}
              variants={childVariants}
            />
          </TvSeriesDetailsDescriptionContainer>

          <MotionDiv variants={childVariants}>
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
          </MotionDiv>
        </TvSeriesDetailsContainer>

        {tvSeries.numberOfEpisodes > 0 && (
          <MotionDiv variants={childVariants}>
            <EpisodesList className="mb-10 md:mb-16" item={tvSeries} />
          </MotionDiv>
        )}
        <MotionDiv variants={childVariants}>
          <Suspense fallback={<SkeletonList className="mb-10 md:mb-16" />}>
            <RecommendationsList
              id={tvSeries.id}
              className="mb-10 md:mb-16"
              replace
            />
          </Suspense>
        </MotionDiv>
        <MotionDiv variants={childVariants}>
          <Suspense fallback={<SkeletonList />}>
            <SimilarList id={tvSeries.id} replace />
          </Suspense>
        </MotionDiv>
      </MotionDiv>
    </>
  );
}
