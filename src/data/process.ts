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
    text: "You get in touch and we have a proper chat. I get to know your business, your customers, and what's working for you and what isn't. Then I design a free mockup of your new homepage.",
    items: ['You get in touch, we have a proper chat.', 'I get to know you and your customers.', "What's working for you, and what isn't.", 'A free homepage mockup, made for you.']
  },
  {
    id: '02',
    title: 'Design',
    text: "If you love the mockup, we go ahead. We agree the pages, features and price, then I design every page around your customers, so the site looks and feels like you.",
    items: ['If you love the mockup, we go ahead.', 'Your pages, your features, your prices.', 'Every page made for your customers.', 'Designed to look and feel like you.']
  },
  {
    id: '03',
    title: 'Refine',
    text: "You see the site as I build it and we refine it together. Your feedback shapes every page, and you decide when it's ready.",
    items: ['You see the site as I build it.', 'Your feedback shapes every page.', "You decide when it's ready.", "Nothing goes live until you're happy."]
  },
  {
    id: '04',
    title: 'Deliver',
    text: "I set up hosting and your domain, then launch. A simple website is usually live in about 4 weeks. 30 days on, we review what's working.",
    items: ['I sort your hosting and domain.', 'Launched, live and handed over to you.', 'A simple site live in about 4 weeks.', "30 days on, we look at what's working."]
  }
];
