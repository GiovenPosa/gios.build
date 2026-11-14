import './page-styles/workPage.css';
import { PageMeta } from '../components/pageMeta';
import { WorkGrid } from '../components/workGrid';
import { ClosingCta } from '../components/closingCta';
import { workData } from '../data/work';

// A pure catalog: the rule bar, every project, then the closing call to
// action. The heading is there for search engines and screen readers only.
export function WorkPage() {
  return (
    <>
      <PageMeta path='/work' />

      <div className='work-page'>
        <div className='work-page-container'>
          <h1 className='visually-hidden'>Recent websites by Gio Posa, a web designer in Bath</h1>
          <WorkGrid items={workData} />
          <ClosingCta />
        </div>
      </div>
    </>
  );
}
