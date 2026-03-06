export const topics = [
  {
    id: 'loss',
    icon: '🍂',
    name: 'Loss',
    question: 'What have you left behind that still travels with you?',
    color: '#C4622D',
  },
  {
    id: 'belonging',
    icon: '🌊',
    name: 'Belonging',
    question: 'Where do you feel most like yourself?',
    color: '#5B8FA8',
  },
  {
    id: 'beauty',
    icon: '✨',
    name: 'Beauty',
    question: 'What stops you in your tracks?',
    color: '#D4A96A',
  },
  {
    id: 'enough',
    icon: '🕊️',
    name: 'Enough',
    question: 'What would make your life feel complete?',
    color: '#7A9E7E',
  },
  {
    id: 'home',
    icon: '🏡',
    name: 'Home',
    question: 'Where is home, really?',
    color: '#9B7653',
  },
  {
    id: 'unknown',
    icon: '🌙',
    name: 'The Unknown',
    question: 'What are you still searching for?',
    color: '#6B5B8A',
  },
];

export function drawTopics(count = 3) {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
