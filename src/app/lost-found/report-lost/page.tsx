import { ReportForm } from '@/components/lost-found/report-form';
import { SiteHeader } from '@/components/shared/site-header';

export default function ReportLostPage() {
  return (
    <>
      <SiteHeader />
      <main><ReportForm type="LOST" /></main>
    </>
  );
}
