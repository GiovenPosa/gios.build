// The home page's My Story cards (src/components/storyStack.tsx).
// `stop` is the short label pinned to the map.
export interface JourneyStep {
  title: string;
  text: string;
  stop: string;
}

export const journeyData: JourneyStep[] = [
  {
    title: "Master's in Computer Science",
    text: 'University of Bristol. Where I learned to engineer things properly, and found I cared just as much about how they look and feel.',
    stop: 'University of Bristol',
  },
  {
    title: 'Software Engineering Intern',
    text: 'IBM. Worked on an AI travel app and learned how big teams design, build and ship.',
    stop: 'IBM',
  },
  {
    title: 'Lead Software Engineer',
    text: 'Vanaways, Bristol. Almost two years building the tools a van sales team uses to track and convert every lead.',
    stop: 'Vanaways',
  },
  {
    title: 'Founder, gios.build',
    text: 'Bringing all of it to small businesses that deserve better than a template.',
    stop: 'gios.build',
  },
];
