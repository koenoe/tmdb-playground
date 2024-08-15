import PageModal from '@/components/Page/PageModal';
import { PageStoreProvider } from '@/components/Page/PageProvider';

type Props = Readonly<{
  params: { id: string; slug: string };
  children: React.ReactNode;
}>;

export default function TvSeriesDetailsModalLayout({ children }: Props) {
  return (
    <PageStoreProvider>
      <PageModal>{children}</PageModal>
    </PageStoreProvider>
  );
}
