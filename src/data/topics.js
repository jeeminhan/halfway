export const topics = [
  {
    id: 'loss',
    icon: '🍂',
    name: 'Loss',
    question: 'What have you left behind that still travels with you?',
    color: '#C4622D',
    demoAnswer1: "The sound of the pojangmacha outside our apartment at night — the low hum of a gas burner, the smell of tteokbokki in the cold air. My mom used to send me down with a few thousand won. I haven't found anything like that quiet feeling anywhere else.",
    demoAnswer2: "The smell of my grandmother's kitchen in Scarborough — samosas frying on a Sunday afternoon, the radio playing old songs I can't name but still hum. We sold the house a few years ago. I haven't been able to eat those samosas since without feeling like something's gone.",
  },
  {
    id: 'belonging',
    icon: '🌊',
    name: 'Belonging',
    question: 'Where do you feel most like yourself?',
    color: '#5B8FA8',
    demoAnswer1: "Walking through Bukchon at dusk when the tourists have gone and it's just the old stone walls and the light going golden. Or honestly, sitting with my grandmother while she watches her dramas — not saying anything, just being in the same room.",
    demoAnswer2: "On the subway ride home late, somewhere around Bloor-Yonge, when the car is nearly empty and the city lights streak past the window. It's the one place I don't have to explain myself to anyone.",
  },
  {
    id: 'beauty',
    icon: '✨',
    name: 'Beauty',
    question: 'What stops you in your tracks?',
    color: '#D4A96A',
    demoAnswer1: "Cherry blossoms on the Han River, but specifically when the petals start to fall — not at full bloom when everyone's there with cameras. That moment when they're almost gone and the water is pink.",
    demoAnswer2: "The first real snowfall of the year — before anyone has walked on it. Everything goes quiet. The whole city becomes something you want to protect.",
  },
  {
    id: 'enough',
    icon: '🕊️',
    name: 'Enough',
    question: 'What would make your life feel complete?',
    color: '#7A9E7E',
    demoAnswer1: "I think I'd need to stop performing competence. There's this pressure to have the right job, the right apartment, to seem like you have it together. I want one day where I don't calculate how I look to others.",
    demoAnswer2: "I think I'd need to stop translating myself — between my parents' world and this one, between who I was supposed to be and who I actually am. Just to exist in one language for a while.",
  },
  {
    id: 'home',
    icon: '🏡',
    name: 'Home',
    question: 'Where is home, really?',
    color: '#9B7653',
    demoAnswer1: "My parents' apartment in Mapo-gu, but only late at night when the city goes quiet. At 2am when the Han River is dark and still — that's the closest thing to home I've ever felt.",
    demoAnswer2: "I don't know anymore. My parents say home is where we came from, but I've never lived there. My friends say home is Toronto, but I've always felt like I'm watching it from one step outside. Maybe home is still somewhere ahead.",
  },
  {
    id: 'unknown',
    icon: '🌙',
    name: 'The Unknown',
    question: 'What are you still searching for?',
    color: '#6B5B8A',
    demoAnswer1: "Someone who can hold both versions of me — who I am in Korean and who I am in English. They're not the same person. I've never met someone who could reach both at once.",
    demoAnswer2: "Something that makes the searching feel finished. I keep thinking the next city, the next thing, will finally be it — but the restlessness just comes with me everywhere.",
  },
];

export function drawTopics(count = 3) {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
