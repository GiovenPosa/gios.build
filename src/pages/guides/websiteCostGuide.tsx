import { GoArrowRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import '../page-styles/guidePage.css';
import { PageMeta } from '../../components/pageMeta';
import { useBooking } from '../../context/bookingContext';
import { FaqThread } from '../../components/faqThread';
import { packagesData, priceRange } from '../../data/packages';
import { WEBSITE_COST_GUIDE as GUIDE } from '../../data/guides';
import { AUDIT_PATH } from '../../data/audit';

// "How much does a website cost for a small business in the UK?": the first
// guide (data/guides.ts). Every market figure is a typical range from the
// sources at the end, numbered where it's used; gios.build's own prices come
// from packages.ts, so they never drift. Prices checked November 2026.

const SOURCES = [
  { label: 'Duport: Average cost of website design for a small business in the UK', url: 'https://www.duport.co.uk/blog/small-business-website-cost-uk/' },
  { label: 'Red Eagle Tech: How much does a website cost in the UK? (2026)', url: 'https://redeagle.tech/blog/how-much-does-a-website-cost-uk' },
  { label: 'The Sequence: How much does a website cost in the UK? (2026)', url: 'https://thesequence.co.uk/blog/how-much-does-a-website-cost-uk' },
  { label: 'Austin Tech Solutions: How much does a website cost in the UK? (2026)', url: 'https://austintechsolutions.co.uk/blog/how-much-does-a-website-cost-uk' },
  { label: 'Startups.co.uk: Wix pricing plans', url: 'https://startups.co.uk/websites/builders/wix-pricing/' },
  { label: 'Startups.co.uk: Squarespace pricing in 2026', url: 'https://startups.co.uk/websites/builders/squarespace-pricing/' },
  { label: 'ExpertSure: How much do freelance web designers cost in the UK? (2026)', url: 'https://www.expertsure.com/uk/web-design/freelance-web-designer-costs/' },
  { label: 'IT Jobs Watch: Web Designer contract rates, UK', url: 'https://www.itjobswatch.co.uk/contracts/uk/web%20designer.do' },
  { label: '365i: The real cost of cheap UK domains', url: 'https://www.365i.co.uk/news/2025/10/15/the-real-cost-of-cheap-uk-domains/' },
  { label: 'ExpertSure: Shopify pricing UK', url: 'https://www.expertsure.com/uk/web-design/shopify-pricing-uk/' },
  { label: 'Swiftcase: How much does a website cost a small business in the UK?', url: 'https://signal.swiftcase.co.uk/blog/how-much-website-cost-small-business-uk/' },
  { label: 'GOV.UK: VAT registration', url: 'https://www.gov.uk/vat-registration' },
];

/** a superscript link to a numbered source */
function Cite({ n }: { n: number }) {
  return (
    <sup className='guide-cite'>
      <a href={`#source-${n}`} aria-label={`Source ${n}: ${SOURCES[n - 1].label}`}>
        {n}
      </a>
    </sup>
  );
}

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function WebsiteCostGuide() {
  const { openBooking } = useBooking();

  return (
    <>
      <PageMeta path={GUIDE.path} />

      <article className='guide-page'>
        <header className='guide-head'>
          <span className='tag-outline'>Guide</span>
          <h1 className='guide-title'>{GUIDE.headline}</h1>
          <p className='guide-dek'>{GUIDE.description}</p>
          <p className='guide-byline'>
            <span>
              By Gio Posa · Updated <time dateTime={GUIDE.updated}>{dateOf(GUIDE.updated)}</time>
            </span>
            <span className='tag-pill'>{GUIDE.minutes} min read</span>
          </p>
        </header>

        <aside className='guide-answer' aria-labelledby='short-answer'>
          <h2 id='short-answer'>The short answer</h2>
          <p>
            Most small businesses in the UK pay roughly <strong>£1,500 to £4,000</strong> for a professionally built website
            <Cite n={1} />
            <Cite n={2} />, plus somewhere between <strong>£10 and £150 a month</strong> to keep it running
            <Cite n={11} />. Building it yourself on Wix or Squarespace costs far less up front, about <strong>£9 to £29 a month</strong>
            <Cite n={5} />
            <Cite n={6} />, but your own time is the real price. An online shop or a site with custom bookings and features usually
            starts around <strong>£5,000</strong>
            <Cite n={4} />.
          </p>
        </aside>

        <nav className='guide-toc' aria-label='In this guide'>
          <p>In this guide</p>
          <ol>
            <li><a href='#at-a-glance'>Prices at a glance</a></li>
            <li><a href='#diy'>Doing it yourself</a></li>
            <li><a href='#freelancer-or-agency'>A freelancer or an agency?</a></li>
            <li><a href='#what-changes-the-price'>What changes the price</a></li>
            <li><a href='#forgotten-costs'>The costs people forget</a></li>
            <li><a href='#red-flags'>Red flags in a quote</a></li>
            <li><a href='#questions'>Questions to ask any web designer</a></li>
            <li><a href='#gios-build'>What gios.build charges</a></li>
          </ol>
        </nav>

        <section className='guide-section' id='at-a-glance'>
          <h2>Prices at a glance</h2>
          <p>
            Here’s what each route typically costs in the UK in 2026. They’re ranges, not quotes: prices vary with what the site
            needs to do, and with who builds it.
          </p>
          <div className='guide-table' role='region' aria-label='Typical website prices in the UK' tabIndex={0}>
            <table>
              <caption className='visually-hidden'>Typical website prices in the UK in 2026</caption>
              <thead>
                <tr>
                  <th scope='col'>Route</th>
                  <th scope='col'>Up front</th>
                  <th scope='col'>Each month</th>
                  <th scope='col'>Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope='row'>Build it yourself (Wix, Squarespace)</th>
                  <td>£0, plus your time</td>
                  <td>About £9 to £29<Cite n={5} /><Cite n={6} /></td>
                  <td>Testing an idea on a very small budget</td>
                </tr>
                <tr>
                  <th scope='row'>A freelancer</th>
                  <td>About £500 to £5,000; a typical 4 to 5 page site £1,200 to £2,000<Cite n={1} /><Cite n={3} /></td>
                  <td>Hosting and care, often £50 to £150<Cite n={11} /></td>
                  <td>Most small businesses</td>
                </tr>
                <tr>
                  <th scope='row'>A small or regional agency</th>
                  <td>About £2,500 to £10,000<Cite n={1} /><Cite n={2} /></td>
                  <td>Often more, with support plans</td>
                  <td>Bigger projects with many people involved</td>
                </tr>
                <tr>
                  <th scope='row'>An online shop or custom features</th>
                  <td>From about £5,000; complex builds £15,000 and up<Cite n={4} /></td>
                  <td>Platform and app fees on top</td>
                  <td>Selling online, or complex bookings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className='guide-section' id='diy'>
          <h2>Doing it yourself</h2>
          <p>
            Website builders let you make a site from a template and pay monthly. Wix’s plans for most small businesses cost about
            £9 to £25 a month billed yearly, before VAT<Cite n={5} />; Squarespace’s about £12 to £29<Cite n={6} />.
          </p>
          <ul>
            <li><strong>Good:</strong> cheap to start, quick, and you’re in control.</li>
            <li><strong>Less good:</strong> the design, writing, photos and getting found on Google are all on you. Templates look alike, so it’s harder to stand out. And you’re renting: leave the builder and you start again from scratch.</li>
          </ul>
          <p>
            A builder makes sense when you’re just starting out or testing an idea. Once the website needs to bring in work, most
            businesses get it built.
          </p>
        </section>

        <section className='guide-section' id='freelancer-or-agency'>
          <h2>A freelancer or an agency?</h2>
          <p>
            <strong>A freelancer</strong> designs and builds your site themselves. Experienced UK freelance web designers typically
            charge about £300 to £450 a day<Cite n={7} />, and job adverts put the median day rate at around £363<Cite n={8} />. A
            small business site takes anything from a few days to a couple of weeks of work, which is why a typical 4 to 5 page site
            costs about £1,200 to £2,000<Cite n={1} />.
          </p>
          <p>
            <strong>An agency</strong> puts a team on your project: a project manager, designers, developers, sometimes a
            copywriter. More people means more process and more cost, typically £2,500 to £10,000 for a small business site
            <Cite n={1} />
            <Cite n={2} />.
          </p>
          <p>
            Neither is better by default. What matters is who actually does the work, who you talk to, and whether they’ve built
            sites like the one you need.
          </p>
        </section>

        <section className='guide-section' id='what-changes-the-price'>
          <h2>What changes the price</h2>
          <p>Two quotes for “a website” can differ by thousands. These are usually why:</p>
          <ul className='guide-points'>
            <li><strong>How many pages.</strong> A one-page site is the cheapest; every page needs designing, writing and building.</li>
            <li><strong>A template or a design made for you.</strong> A template is quicker and cheaper; a custom design fits your business exactly.</li>
            <li><strong>Who writes the words and takes the photos.</strong> Copywriting and photography are often extras.</li>
            <li><strong>Bookings, payments or a shop.</strong> Anything people can do on the site, beyond reading it, adds work.</li>
            <li><strong>Connecting your tools.</strong> Linking a booking app, Stripe, Shopify or your email takes time to set up and test.</li>
            <li><strong>Getting found on Google.</strong> The basics should come with any site; local SEO, like a page for each town you serve, is extra work.</li>
            <li><strong>Rounds of changes.</strong> How many revisions are included, and what happens after that.</li>
          </ul>
        </section>

        <section className='guide-section' id='forgotten-costs'>
          <h2>The costs people forget</h2>
          <p>The build is a one-off. These come round every month or year:</p>
          <ul className='guide-points'>
            <li><strong>Your domain name.</strong> A .co.uk usually renews at about £12 to £27 a year; cheap first-year deals often renew higher<Cite n={9} />.</li>
            <li><strong>Hosting and care.</strong> Keeping the site online, backed up, secure and updated: commonly £50 to £150 a month for a small business<Cite n={11} />. Some designers include hosting in a care plan.</li>
            <li><strong>Apps you plug in.</strong> Booking tools, email marketing, or a shop platform. Shopify’s Basic plan, for example, is about £19 to £25 a month plus card fees<Cite n={10} />.</li>
            <li><strong>Your time.</strong> Updating prices, menus and photos yourself, or paying someone to.</li>
          </ul>
        </section>

        <section className='guide-section' id='red-flags'>
          <h2>Red flags in a quote</h2>
          <ul className='guide-points is-flags'>
            <li><strong>You won’t own your domain or your site.</strong> It should be in your name, so you can leave whenever you like.</li>
            <li><strong>Long contracts or exit fees.</strong> Paying monthly for the build is fine; being locked in isn’t.</li>
            <li><strong>No mention of Google.</strong> Page titles, fast pages and Google Search Console should come as standard.</li>
            <li><strong>No mention of phones.</strong> Most of your visitors will see the site on one first.</li>
            <li><strong>A vague scope.</strong> “A website”, with no list of pages and features, makes the extras impossible to predict.</li>
            <li><strong>No way to tell if it’s working.</strong> You should be able to see how many people visit and get in touch.</li>
          </ul>
        </section>

        <section className='guide-section' id='questions'>
          <h2>Questions to ask any web designer</h2>
          <ol className='guide-points is-numbered'>
            <li>Will I own my domain and my website?</li>
            <li>What exactly is included, and what costs extra?</li>
            <li>What will I pay each month or year after launch?</li>
            <li>Can I see sites you’ve built, on my phone?</li>
            <li>How will people find me on Google?</li>
            <li>Who do I contact when something breaks, and how quickly will it be fixed?</li>
            <li>How many rounds of changes are included?</li>
          </ol>
        </section>

        <section className='guide-section guide-ours' id='gios-build'>
          <h2>What gios.build charges</h2>
          <p>
            gios.build is one person, Gio, designing and hand-coding every site from Bath. With no agency overheads, the prices sit
            below most agencies’, without cutting the parts that matter: SEO foundations, accessibility, fast pages and a live
            dashboard come with every package.
          </p>
          <ul className='guide-packages'>
            {packagesData.map((pkg) => (
              <li key={pkg.id}>
                <span className='guide-package-name'>{pkg.name}</span>
                <span className='guide-package-price'>{priceRange(pkg)}</span>
                <span className='guide-package-for'>{pkg.for}</span>
              </li>
            ))}
          </ul>
          <p>
            Every project starts with a free mockup of your new homepage, so you see it before you spend a penny. Already have a
            website? A <Link to={AUDIT_PATH}>free audit</Link> shows what it’s costing you.
          </p>
          <div className='guide-actions'>
            <button type='button' className='hero-action-button' onClick={() => openBooking('Guide: website cost')}>
              <p>Get a free mockup</p>
              <GoArrowRight aria-hidden />
            </button>
            <Link to='/packages' className='hero-action-button secondary'>
              <p>See the packages</p>
            </Link>
          </div>
        </section>

        <section className='home-faq-block guide-faq'>
          <h2 className='home-faq-headline'>
            <span>Still wondering?</span> <span>Just ask.</span>
          </h2>
          <p className='home-faq-subtext'>The questions people ask most about website prices.</p>
          <FaqThread items={GUIDE.faq} />
        </section>

        <section className='guide-sources' aria-labelledby='sources'>
          <h2 id='sources'>Sources</h2>
          <p>
            Prices checked on {dateOf(GUIDE.updated)}. Most published price guides come from web design companies, so treat
            every figure as a typical range and check each provider’s own pricing before deciding.
          </p>
          <ol>
            {SOURCES.map((source, index) => (
              <li key={source.url} id={`source-${index + 1}`}>
                <a href={source.url} target='_blank' rel='noopener noreferrer'>
                  {source.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </>
  );
}
