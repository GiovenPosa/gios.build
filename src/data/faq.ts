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
