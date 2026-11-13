export interface ProcessStep {
  id: string;
  title: string;
  text: string;
  /** the step in short points, the way the services list theirs */
  items: string[];
}

export const processData: ProcessStep[] = [
  {
    id: '01',
    title: 'Discover',
    text: 'We talk about your business, your customers and what the website needs to do. Then I design a free mockup of your new homepage.',
    items: ['A chat about your business', 'Who your customers are', 'What the website needs to do', 'A free mockup of your homepage']
  },
  {
    id: '02',
    title: 'Design',
    text: 'If you love the mockup, we agree the pages, features and price, and I design the rest of the site around it.',
    items: ['Go ahead only if you love the mockup', 'Pages and features agreed', 'The price agreed upfront', 'The rest designed around it']
  },
  {
    id: '03',
    title: 'Refine',
    text: 'You see progress as I build and we refine it together. How many rounds depends on how bespoke the project is, and we agree that upfront.',
    items: ['See progress as I build', 'Refine it together', 'Rounds agreed upfront', 'More rounds for more bespoke builds']
  },
  {
    id: '04',
    title: 'Deliver',
    text: "I set up hosting and your domain, then launch. A simple website is usually live in about 4 weeks. 30 days on, we review what's working.",
    items: ['Hosting and domain set up', 'Launched and live', 'A simple site in about 4 weeks', "A review at 30 days of what's working"]
  }
];
