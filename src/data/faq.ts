// Shared by the packages page and the home page FAQ sections
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqData: FaqItem[] = [
  {
    question: 'How long does it take?',
    answer: "A simple website is usually live in about 4 weeks. Bigger or more bespoke sites take longer, and you'll get a timeline with your quote."
  },
  {
    question: 'What do I need to provide?',
    answer: "The basics about your business, your logo if you have one, and any photos you'd like to use. If you're stuck on wording, I'll help you shape it."
  },
  {
    question: 'How many revisions do I get?',
    answer: "It depends on how bespoke the project is, so we agree it upfront in your quote. The free mockup means we're aligned on the direction before the build starts."
  },
  {
    question: 'Will people find me on Google?',
    answer: "Every site is built to be found: clear page titles, fast pages, your business details in a form Google understands, and Search Console set up so Google knows you exist. Growth sites go further with local SEO, so you show up when people nearby search for what you do: your Google Business Profile, a page for each service or area, and a plan for reviews."
  },
  {
    question: 'Do you only work with businesses in Bath?',
    answer: "No. I'm based in Bath and happy to meet in person around Bath, Bristol, Trowbridge and the rest of Somerset and Wiltshire. Anywhere else in the UK, we can do everything over a video call, and the free mockup works just the same."
  },
  {
    question: 'Can you handle hosting and my domain?',
    answer: 'Yes. Hosting and domain setup can be included. The cost depends on what your site needs, and I\'ll include it in your quote.'
  },
  {
    question: "How will I know it's working?",
    answer: "Every site gets privacy-friendly visit tracking, tested before launch. 30 days in, we look at the real numbers together. I won't promise you a number, but I'll always show you an honest one."
  },
  {
    question: 'What happens after launch?',
    answer: "Your 30-day review comes first. After that, you can take it from there, or I can look after it with a monthly plan covering updates, backups and small changes."
  },
  {
    question: 'Is the mockup really free?',
    answer: 'Yes, with no obligation. If you love it, we build the full site. If not, no hard feelings.'
  },
];
