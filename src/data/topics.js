export const topics = [
  {
    id: 'loss',
    icon: '🍂',
    name: 'Loss',
    question: 'What have you left behind that still travels with you?',
    color: '#C4622D',
    demoAnswer: "The smell of my grandmother's kitchen in Scarborough — samosas frying on a Sunday afternoon, the radio playing old songs I can't name but still hum. We sold the house a few years ago. I haven't been able to eat those samosas since without feeling like something's gone.",
  },
  {
    id: 'belonging',
    icon: '🌊',
    name: 'Belonging',
    question: 'Where do you feel most like yourself?',
    color: '#5B8FA8',
    demoAnswer: "On the subway ride home late, somewhere around Bloor-Yonge, when the car is nearly empty and the city lights streak past the window. It's the one place I don't have to explain myself to anyone.",
  },
  {
    id: 'beauty',
    icon: '✨',
    name: 'Beauty',
    question: 'What stops you in your tracks?',
    color: '#D4A96A',
    demoAnswer: "The first real snowfall of the year — before anyone has walked on it. Everything goes quiet. The whole city becomes something you want to protect.",
  },
  {
    id: 'enough',
    icon: '🕊️',
    name: 'Enough',
    question: 'What would make your life feel complete?',
    color: '#7A9E7E',
    demoAnswer: "I think I'd need to stop translating myself — between my parents' world and this one, between who I was supposed to be and who I actually am. Just to exist in one language for a while.",
  },
  {
    id: 'home',
    icon: '🏡',
    name: 'Home',
    question: 'Where is home, really?',
    color: '#9B7653',
    demoAnswer: "I don't know anymore. My parents say home is where we came from, but I've never lived there. My friends say home is Toronto, but I've always felt like I'm watching it from one step outside. Maybe home is still somewhere ahead.",
  },
  {
    id: 'unknown',
    icon: '🌙',
    name: 'The Unknown',
    question: 'What are you still searching for?',
    color: '#6B5B8A',
    demoAnswer: "Something that makes the searching feel finished. I keep thinking the next city, the next thing, will finally be it — but the restlessness just comes with me everywhere.",
  },
];

export function drawTopics(count = 3) {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
