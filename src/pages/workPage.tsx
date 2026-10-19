import './page-styles/workPage.css';
import { PageMeta } from '../components/pageMeta';
import { SectionBar } from '../components/sectionBar';
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
          <h1 className='visually-hidden'>Work by Gio Posa, web designer and developer in Bath</h1>
          <SectionBar label='Work' className='work-page-bar'>
            <span>{String(workData.length).padStart(2, '0')} projects</span>
          </SectionBar>
          <WorkGrid items={workData} />
          <ClosingCta />
        </div>
      </div>
    </>
  );
}
