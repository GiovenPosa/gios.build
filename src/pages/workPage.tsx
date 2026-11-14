import { useParams } from 'react-router-dom';
import './page-styles/workPage.css';
import { PageMeta } from '../components/pageMeta';
import { WorkGrid } from '../components/workGrid';
import { ClosingCta } from '../components/closingCta';
import { workData } from '../data/work';
import { workBySlug } from '../data/workAbout';
import { NotFoundPage } from './notFoundPage';

// A pure catalog: the rule bar, every project, then the closing call to
// action. The heading is there for search engines and screen readers only.
// At a project's address (/work/kape-coffee) it opens with that project's
// larger view showing, which reads as the project's own page.
export function WorkPage() {
  const { slug } = useParams();
  const project = slug ? workBySlug(slug) : undefined;
  if (slug && !project) return <NotFoundPage />;

  return (
    <>
      <PageMeta path='/work' />

      <div className='work-page'>
        <div className='work-page-container'>
          <h1 className='visually-hidden'>Recent websites by Gio Posa, a web designer in Bath</h1>
          <WorkGrid items={workData} openTitle={project} />
          <ClosingCta />
        </div>
      </div>
    </>
  );
}
