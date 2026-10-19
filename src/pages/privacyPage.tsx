import './page-styles/privacyPage.css';
import { useState } from 'react';
import { PageMeta } from '../components/pageMeta';
import { isOptedOut, setOptedOut } from '../lib/analytics';
import { SectionBar } from '../components/sectionBar';
import { Reveal } from '../components/reveal';

// When this was last changed; update it with the text.
const UPDATED = '19 October 2026';

// The ICO registration number, once the data protection fee is paid
// (ico.org.uk/fee). The line under "Who I am" shows only once it's set.
const ICO_NUMBER = '';

// The privacy notice: what the enquiry form collects, why, where it's kept,
// for how long, and people's rights under UK GDPR, in plain English.
export function PrivacyPage() {
  // the free, simple way to object to visit counting that the law asks for
  const [optedOut, setOut] = useState(isOptedOut);
  const toggleCounting = () => {
    setOptedOut(!optedOut);
    setOut(!optedOut);
  };

  return (
    <>
      <PageMeta path='/privacy' />

      <div className='privacy-page'>
        <div className='privacy-container'>
          <SectionBar label='Privacy' className='privacy-bar'>
            <span>Updated {UPDATED}</span>
          </SectionBar>

          <Reveal as="h1" className='privacy-title'>
            <span>Your details,</span> <span>kept simple.</span>
          </Reveal>
          <Reveal as="p" className='privacy-lede' delay={80}>
            I only collect what I need to reply to you and quote for your website. No cookies, no ads, no mailing lists.
          </Reveal>

          <div className='privacy-body'>
            <section>
              <h2>Who I am</h2>
              <p>
                gios.build is run by me, Gio Posa, a web designer and developer based in Bath, UK. I'm responsible for the
                details you send me (the "data controller"). You can reach me at <a href='mailto:contact@gios.build'>contact@gios.build</a>.
              </p>
              {ICO_NUMBER && <p>I'm registered with the Information Commissioner's Office, number {ICO_NUMBER}.</p>}
            </section>

            <section>
              <h2>What I collect</h2>
              <p>When you fill in the "Get a free mockup" form, you send me:</p>
              <ul>
                <li>your name and email address</li>
                <li>your phone number and current website, if you add them</li>
                <li>the kind of business you run, and the package and budget you pick</li>
                <li>anything you write in your message</li>
              </ul>
              <p>If you email me directly, I'll have whatever you put in that email.</p>
            </section>

            <section>
              <h2>Counting visits</h2>
              <p>
                To see how the site is doing, I count visits with Umami, a privacy-friendly analytics service. It tells me totals:
                which pages are viewed, which buttons are used, the country and kind of device people visit from, and which
                website or search sent them here. It uses no cookies, doesn't follow you around other sites, and never tells me
                who you are. To tell the country, your IP address is passed on to Umami as the page loads; it works out the
                country and doesn't keep the address. Umami does this only on my behalf, and nothing is used for advertising.
              </p>
              <div className='privacy-optout'>
                <button type='button' className='privacy-optout-button' onClick={toggleCounting} aria-pressed={optedOut}>
                  {optedOut ? 'Count my visits again' : "Don't count my visits"}
                </button>
                <span className='privacy-optout-state' role='status'>
                  {optedOut ? "Your visits aren't counted on this browser." : 'Your visits are counted, in totals only.'}
                </span>
              </div>
            </section>

            <section>
              <h2>What I don't collect</h2>
              <p>
                This site uses no cookies and no advertising trackers. Its fonts are hosted on the site itself, so visiting it
                doesn't send anything about you to Google or anyone else. Like every website, the company that hosts it keeps
                basic server logs, such as IP addresses, for security.
              </p>
            </section>

            <section>
              <h2>Why I use your details</h2>
              <p>
                To reply to your enquiry, design your free homepage mockup and send you a quote. If we then work together, I use
                them to plan, build and look after your website. That's me taking steps you've asked for before we agree a project,
                and replying to the enquiries people send me.
              </p>
              <p>I'll never sell your details, share them for marketing, or add you to a mailing list.</p>
            </section>

            <section>
              <h2>Where they're kept</h2>
              <p>
                Form enquiries are stored with Supabase, a database service. The site is hosted by Cloudflare, and visits are
                counted by Umami. All three handle your details only on my behalf. Some of them store data outside the UK; where
                they do, they use the safeguards UK law requires.
              </p>
            </section>

            <section>
              <h2>How long I keep them</h2>
              <p>
                If we don't go on to work together, I delete your enquiry within 12 months. If we do, I keep your details for as
                long as the project needs, and project and payment records for as long as UK tax rules require, usually six years.
              </p>
            </section>

            <section>
              <h2>Your rights</h2>
              <p>
                You can ask me for a copy of the details I hold about you, to correct them, to delete them, or to stop using them.
                Email <a href='mailto:contact@gios.build'>contact@gios.build</a> and I'll reply within one month.
              </p>
              <p>
                If you're unhappy with how I've handled your details, you can complain to the Information Commissioner's Office
                at <a href='https://ico.org.uk/make-a-complaint/' target='_blank' rel='noopener noreferrer'>ico.org.uk</a>.
                I'd appreciate the chance to put it right first.
              </p>
            </section>

            <section>
              <h2>Changes</h2>
              <p>If anything here changes, I'll update this page and the date at the top.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
