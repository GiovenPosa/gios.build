import './page-styles/workPage.css';
import { Helmet } from 'react-helmet-async';
import { SectionBar } from '../components/sectionBar';
import { WorkGrid } from '../components/workGrid';
import { ClosingCta } from '../components/closingCta';
import { workData } from '../data/work';

// A pure catalog: the rule bar, every project, then the closing call to
// action. The heading is there for search engines and screen readers only.
export function WorkPage() {
  return (
    <>
      <Helmet>
        <title>Work | gios.build | Websites & Software Built by Gio Posa</title>

        <meta
          name="description"
          content="Selected projects by Gio Posa: Van-Spec and a lead tracker for Vanaways, Staffly, CheckedIn, Orbital Intelligence, and an AI travel app built during an IBM internship."
        />

        <meta
          name="keywords"
          content="web design portfolio, ui ux portfolio, software engineering portfolio, digital product design, frontend development work, case studies, gios.build projects"
        />

        <link rel="canonical" href="https://www.gios.build/work" />
      </Helmet>

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
