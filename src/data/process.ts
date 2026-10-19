export interface ProcessStep {
  id: string;
  title: string;
  text: string;
}

export const processData: ProcessStep[] = [
  {
    id: '01',
    title: 'Discover',
    text: 'We talk about your business, your customers and what the website needs to do. Then I design a free mockup of your new homepage.'
  },
  {
    id: '02',
    title: 'Design',
    text: 'If you love the mockup, we agree the pages, features and price, and I design the rest of the site around it.'
  },
  {
    id: '03',
    title: 'Refine',
    text: 'You see progress as I build and we refine it together. How many rounds depends on how bespoke the project is, and we agree that upfront.'
  },
  {
    id: '04',
    title: 'Deliver',
    text: "I set up hosting and your domain, then launch. A simple website is usually live in about 4 weeks, and I can look after it monthly from there."
  }
];
