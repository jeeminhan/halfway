// src/components/EncounterFlow.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { topics as TOPIC_OPTIONS } from '../data/topics'
import SettingPicker from './SettingPicker'
import ProfileSetup from './ProfileSetup'
import RecordingScreen from './RecordingScreen'
import KeepsakeSummary from './KeepsakeSummary'

const FALLBACK_KEEPSAKE = {
  thread: "Something happened here that words can't quite hold.",
  person1Window: '',
  person2Window: '',
  reflection: "What if the thing you're both homesick for isn't actually a place?",
  continuePrompt: 'Stay in touch.',
}

const COUNTRY_FACTS = {
  'South Korea': {
    food: 'tteokbokki from a pojangmacha after dark',
    ritual: 'bowing to elders at Seollal before the first meal',
    place: "the cherry blossom tunnels along Yeouido's Han River paths",
    sound: 'the subway jingle before doors close at Seoul Station',
  },
  Nigeria: {
    food: 'smoky party jollof with fried plantain',
    ritual: 'Sunday service in Lagos flowing straight into family visits',
    place: 'the Third Mainland Bridge glowing at sunset',
    sound: 'generators humming through humid nights',
  },
  Japan: {
    food: 'a steaming bowl of ramen from the neighborhood shop with a noren curtain',
    ritual: 'hanami picnics under sakura with friends and coworkers',
    place: 'the backstreets of an old shotengai at dusk',
    sound: 'the crossing melody at neighborhood train stations',
  },
  India: {
    food: 'masala chai simmering with cardamom at home',
    ritual: 'lighting a diya at dusk during festival evenings',
    place: 'the crowded local bazaar before monsoon rain',
    sound: 'pressure cookers whistling and temple bells at sunset',
  },
  China: {
    food: 'hand-pulled noodles with chili oil from a street stall',
    ritual: 'Lunar New Year reunion dinners with every seat filled',
    place: 'the morning tai chi corners in the neighborhood park',
    sound: 'mahjong tiles clicking through open apartment windows',
  },
  Brazil: {
    food: 'feijoada on a long Saturday lunch',
    ritual: 'Sunday family almoco that stretches into evening',
    place: 'the beachfront calcadao at golden hour',
    sound: 'samba percussion drifting from a nearby roda',
  },
  Mexico: {
    food: 'tacos al pastor sliced straight from the trompo',
    ritual: 'Dia de Muertos altars built with family stories',
    place: 'the zocalo when the plaza starts to glow at night',
    sound: 'the tamalero whistle echoing down the street',
  },
  'United States': {
    food: 'barbecue at a backyard cookout',
    ritual: 'Thanksgiving with too many sides and the same old stories',
    place: 'the hometown high school field under Friday night lights',
    sound: 'screen doors slamming on a summer block',
  },
  Canada: {
    food: 'poutine shared after a late game',
    ritual: 'long winter potlucks where everyone brings something warm',
    place: 'the lakeside dock at the edge of cottage country',
    sound: 'skates scraping on an outdoor rink',
  },
  'United Kingdom': {
    food: 'Sunday roast with gravy passed around the table',
    ritual: 'putting the kettle on before any hard conversation',
    place: 'the local high street on a rainy evening',
    sound: 'the low rumble of the Tube arriving',
  },
  Philippines: {
    food: 'garlic fried rice and longsilog at breakfast',
    ritual: 'Simbang Gabi before dawn in December',
    place: 'the barangay basketball court lit late into the night',
    sound: "karaoke spilling from a neighbor's house",
  },
  Colombia: {
    food: 'arepas on a hot griddle before everyone wakes up',
    ritual: 'long sobremesa after lunch with the whole family',
    place: 'the ciclovia streets on a Sunday morning',
    sound: 'vallenato and bus chatter mixing in afternoon traffic',
  },
  Kenya: {
    food: 'nyama choma shared with kachumbari on a weekend',
    ritual: 'harambee-style community giving when someone needs help',
    place: 'Uhuru Park on a clear Nairobi afternoon',
    sound: 'matatu conductors calling routes over loud music',
  },
  Ethiopia: {
    food: 'injera torn by hand around a shared mesob',
    ritual: 'the slow jebena coffee ceremony with three rounds',
    place: 'the neighborhood roundabout where everyone meets at dusk',
    sound: 'church chants before sunrise',
  },
  Ghana: {
    food: 'waakye wrapped up for breakfast',
    ritual: 'pouring libation before major family gatherings',
    place: 'the trotro station where everyone has a destination',
    sound: 'highlife from passing taxis and hawkers calling',
  },
  Egypt: {
    food: 'koshari from a busy downtown shop',
    ritual: 'Ramadan evenings that begin with dates and soup',
    place: 'the Corniche along the Nile after sunset',
    sound: 'the adhan weaving through city traffic',
  },
  Germany: {
    food: 'fresh pretzels and butter from the morning bakery',
    ritual: 'Advent evenings with candles and quiet routines',
    place: 'the neighborhood Weihnachtsmarkt in winter',
    sound: 'church bells and bicycle tires on cobblestones',
  },
  France: {
    food: 'a warm baguette torn before it reaches home',
    ritual: 'lingering over Sunday lunch without checking the time',
    place: 'the neighborhood marche on market day',
    sound: 'espresso cups clinking at the corner cafe',
  },
  Australia: {
    food: 'a meat pie and tomato sauce at the footy',
    ritual: 'Christmas lunch in the heat under a verandah',
    place: 'the local beach at first light',
    sound: 'magpies at dawn and cicadas in summer',
  },
  Indonesia: {
    food: 'nasi goreng from a late-night warung',
    ritual: 'mudik journeys to reunite for Lebaran',
    place: 'the neighborhood pasar before the sun gets high',
    sound: 'the mosque call mixing with motorbike traffic',
  },
  Turkey: {
    food: 'simit and strong tea by the ferry',
    ritual: 'bayram visits, hand-kissing elders, then sweets',
    place: 'the Bosphorus shoreline at evening',
    sound: 'the tea spoon tapping the tulip glass',
  },
  'Saudi Arabia': {
    food: 'kabsa shared from one large platter',
    ritual: 'gathering for qahwa and dates after maghrib',
    place: 'the old souq lanes before night prayers',
    sound: 'the adhan carrying across still evening air',
  },
  Iran: {
    food: 'ghormeh sabzi simmering all afternoon',
    ritual: 'setting the Haft-Seen table for Nowruz',
    place: 'the neighborhood park when families picnic at dusk',
    sound: 'the samovar bubbling beside long conversations',
  },
  Vietnam: {
    food: 'pho with fresh herbs at an early street stall',
    ritual: 'Tet visits where elders give lucky envelopes',
    place: 'the alley market opening before sunrise',
    sound: 'motorbike horns threading through morning traffic',
  },
  Thailand: {
    food: 'som tam pounded to order at a market stall',
    ritual: 'Songkran water blessings and family reunions',
    place: 'the soi food street once the heat breaks',
    sound: 'long-tail boats and market vendors calling',
  },
  Pakistan: {
    food: 'biryani on a crowded family table',
    ritual: 'Eid morning hugs after prayer',
    place: 'the chai dhaba where conversations run past midnight',
    sound: 'the adhan and cricket commentary from nearby homes',
  },
  Bangladesh: {
    food: 'ilish with mustard on a family lunch table',
    ritual: 'Eid shopping in packed night bazaars',
    place: "the village ghat at the river's edge",
    sound: 'rickshaw bells weaving through Dhaka traffic',
  },
  Russia: {
    food: 'borscht with black bread at the kitchen table',
    ritual: "New Year's Eve toasts that last past midnight",
    place: 'the dacha garden in short summer',
    sound: 'metro escalators and train doors in winter coats',
  },
  Ukraine: {
    food: 'varenyky folded together before celebrations',
    ritual: 'Orthodox Christmas Eve with twelve meatless dishes',
    place: 'the chestnut-lined boulevards in Kyiv spring',
    sound: 'church bells and distant trolleybuses',
  },
  Poland: {
    food: 'pierogi made in batches with family',
    ritual: 'Wigilia supper with an extra place set at the table',
    place: 'the rynek square at dusk',
    sound: 'tram bells over old stone streets',
  },
  Italy: {
    food: 'pasta al pomodoro that tastes like home',
    ritual: 'the passeggiata before dinner',
    place: 'the neighborhood piazza where everyone crosses paths',
    sound: 'espresso machines and scooters at morning rush',
  },
  Spain: {
    food: 'tortilla de patatas shared at the bar',
    ritual: 'la sobremesa that keeps everyone at the table',
    place: 'the plaza when evening finally cools',
    sound: 'church bells and cups at the cafe terrace',
  },
  Argentina: {
    food: 'asado smoke on a Sunday afternoon',
    ritual: 'mate passed hand to hand in a circle',
    place: 'the barrio corner cancha where kids play late',
    sound: 'a bandoneon line drifting from an open window',
  },
  Peru: {
    food: "ceviche at midday when it's freshest",
    ritual: 'family almuerzo that stretches for hours',
    place: 'the malecon cliffs above the Pacific',
    sound: 'combis stopping and street vendors singing offers',
  },
  Chile: {
    food: 'empanadas de pino at family gatherings',
    ritual: 'once tea in the early evening',
    place: 'the cerros of Valparaiso at sunset',
    sound: 'micro buses braking and ocean wind through narrow streets',
  },
  Venezuela: {
    food: 'arepas stuffed and shared at any hour',
    ritual: 'hallacas assembly line before Christmas',
    place: 'the plaza where neighbors gather after dusk',
    sound: 'baseball games on radio through open windows',
  },
  Cuba: {
    food: 'ropa vieja with black beans and rice on Sundays',
    ritual: 'late-night domino games on the block',
    place: 'the Malecon when the heat drops',
    sound: 'son cubano from a nearby doorway',
  },
  Haiti: {
    food: 'diri kole ak pwa with pikliz at family meals',
    ritual: 'rara season processions filling the streets',
    place: 'the lakou where neighbors and cousins gather',
    sound: 'kompa rhythms and tap-tap horns',
  },
  Jamaica: {
    food: 'jerk chicken smoked over pimento wood',
    ritual: 'Sunday dinner after church with the whole family',
    place: 'the district lane where everybody knows your people',
    sound: 'dancehall bass and dominoes snapping',
  },
  Taiwan: {
    food: 'beef noodle soup on a rainy night',
    ritual: 'Lunar New Year visits with red envelopes and tea',
    place: 'the night market lanes after dark',
    sound: 'the garbage truck melody everyone recognizes',
  },
  'Hong Kong': {
    food: 'dim sum carts on a loud Sunday morning',
    ritual: 'burning incense at Wong Tai Sin before exams or big decisions',
    place: 'the harbor promenade when neon reflects on the water',
    sound: 'the pedestrian crossing beeps in Mong Kok',
  },
  Singapore: {
    food: 'chicken rice at your regular hawker stall',
    ritual: 'reunion steamboat dinners during Lunar New Year',
    place: 'the void deck where neighbors linger at night',
    sound: 'the MRT chime before the doors close',
  },
  Malaysia: {
    food: 'nasi lemak wrapped in banana leaf for breakfast',
    ritual: 'open house visits through Hari Raya',
    place: 'the mamak corner where friends talk until late',
    sound: 'the teh tarik pull and wok fire in the night air',
  },
  Nepal: {
    food: 'dal bhat that somehow tastes right every day',
    ritual: 'Dashain tika from elders in crowded family homes',
    place: 'the neighborhood chowk beneath prayer flags',
    sound: 'temple bells and scooters climbing narrow roads',
  },
  'Sri Lanka': {
    food: 'hoppers and pol sambol at breakfast',
    ritual: 'New Year games and milk rice in April',
    place: 'the Galle Face promenade in the evening breeze',
    sound: 'the train horn along the coast',
  },
  Myanmar: {
    food: 'mohinga at a roadside tea shop',
    ritual: 'Thingyan water festival visits across households',
    place: 'the monastery road at first light',
    sound: "teashop spoons and street monks' chants",
  },
}

function getFacts(country) {
  const normalizedCountry = typeof country === 'string' ? country.trim() : ''
  if (!normalizedCountry || !COUNTRY_FACTS[normalizedCountry]) {
    return {
      food: 'your favorite home-cooked meal',
      ritual: 'the traditions you grew up with',
      place: 'the streets you know by heart',
      sound: 'the sounds of home',
    }
  }
  return COUNTRY_FACTS[normalizedCountry]
}

// Generate contextual demo questions client-side when API is unavailable
function generateDemoQuestions(p1, p2, setting, drawnTopics) {
  const p1Place = p1.city || p1.country || 'your city'
  const p2Place = p2.city || p2.country || 'their city'
  const p1Name = p1.name || p1Place
  const p2Name = p2.name || p2Place
  const p1Occ = p1.occupation || 'person'
  const p2Occ = p2.occupation || 'person'
  const settingLabel = setting || 'this place'
  const p1Facts = getFacts(p1.country)
  const p2Facts = getFacts(p2.country)

  const templates = {
    loss: {
      question1: `${p1Name}, as a ${p1Occ} from ${p1Place}, what part of ${p1Facts.ritual} still follows you around ${settingLabel} — not as nostalgia, but as a rhythm your body still waits for?`,
      question2: `${p2Name}, growing up in ${p2Place} with ${p2Facts.sound} and the taste of ${p2Facts.food} — as a ${p2Occ}, what's the one sensory thing from home you'd give anything to walk into right now?`,
    },
    belonging: {
      question1: `${p1Name}, in ${p1Place}, where did you feel most like yourself — maybe somewhere like ${p1Facts.place}? Is there anywhere in ${settingLabel} that comes close?`,
      question2: `${p2Name}, as a ${p2Occ} far from ${p2Place}, when was the last time you felt completely at home — like when ${p2Facts.ritual} makes everyone exhale and stop performing?`,
    },
    beauty: {
      question1: `${p1Name}, what's something beautiful in ${p1Place} that most people walk past without noticing — the kind of beauty you learned around ${p1Facts.place} as a ${p1Occ}?`,
      question2: `${p2Name}, in ${p2Place}, what still stops you in your tracks — a moment like ${p2Facts.place}, or even ${p2Facts.sound} that makes everything else go quiet?`,
    },
    enough: {
      question1: `${p1Name}, as a ${p1Occ} from ${p1Place}, what would make your life feel complete — not successful, but complete, the way ${p1Facts.food} can feel like enough for one evening?`,
      question2: `${p2Name}, if you could stop translating yourself between ${p2Place} and here, between being a ${p2Occ} and being yourself, and just rest in ${p2Facts.ritual} again — what would that feel like?`,
    },
    home: {
      question1: `${p1Name}, when someone in ${settingLabel} asks "where are you from?" — do you say ${p1Place}, or do you answer with things like ${p1Facts.food} and ${p1Facts.place} instead?`,
      question2: `${p2Name}, is ${p2Place} still home, or is home something you're still looking for? Would home need ${p2Facts.sound}, ${p2Facts.food}, or something even deeper to make you stop searching?`,
    },
    unknown: {
      question1: `${p1Name}, as a ${p1Occ} who left ${p1Place}, what are you still searching for that no city, no degree, no achievement has been able to give you — maybe something you only felt in moments like ${p1Facts.ritual}?`,
      question2: `${p2Name}, what would it mean to be fully known — not just your ${p2Occ} self here, but the ${p2Place} version shaped by ${p2Facts.place} and ${p2Facts.sound} too — by someone who isn't going anywhere?`,
    },
  }

  return drawnTopics.map(t => {
    const tmpl = templates[t.id] || {
      question1: `${p1Name}, what's something about life in ${p1Place} as a ${p1Occ} that you wish people here understood — maybe hidden in ${p1Facts.food} or ${p1Facts.sound}?`,
      question2: `${p2Name}, what's something about ${p2Place} that you carry with you everywhere — something a ${p2Occ} from there just never loses, like ${p2Facts.ritual}?`,
    }
    return { ...t, question1: tmpl.question1, question2: tmpl.question2 }
  })
}

// Generate contextual demo keepsake when API is unavailable
function generateDemoKeepsake(p1, p2, setting) {
  const p1Place = p1.city || p1.country || 'your city'
  const p2Place = p2.city || p2.country || 'their city'
  const p1Name = p1.name || p1Place
  const p2Name = p2.name || p2Place
  const p1Facts = getFacts(p1.country)
  const p2Facts = getFacts(p2.country)
  return {
    thread: `Both of you — ${p1Name} from ${p1Place}, ${p2Name} from ${p2Place} — are holding the same quiet hunger: to be fully known, in a place that feels like home, by someone who isn't going anywhere.`,
    person1Window: `${p2Name}'s world in ${p2Place} isn't just a place on a map — it's ${p2Facts.food}, it's ${p2Facts.sound}, it's a version of home that still shows up in their voice even far from ${p2Facts.place}.`,
    person2Window: `${p1Name}'s life in ${p1Place} was shaped by more than culture — from ${p1Facts.ritual} to ${p1Facts.food}, it taught them to notice beauty in small moments and to keep longing for something lasting.`,
    reflection: `You met in ${setting || 'a place'} you'll both eventually leave. But what you shared — that hunger to be known completely, to belong somewhere permanent — that's not going anywhere. What if there's a Person who already knows both versions of you, the ${p1Place} one and the one sitting here, and isn't planning on leaving?`,
    continuePrompt: `Exchange numbers. This conversation isn't done yet.`,
  }
}

export default function EncounterFlow({ initialPerson1, initialPerson2, onSave, onClose }) {
  const [step, setStep] = useState('setting')
  const [setting, setSetting] = useState(null)
  const [person1] = useState(initialPerson1 || { name: '', city: '', country: '', occupation: '' })
  const [person2, setPerson2] = useState(initialPerson2 || { name: '', city: '', country: '', occupation: '' })
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)
  const [keepsake, setKeepsake] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [topicError, setTopicError] = useState('')
  const [processingError, setProcessingError] = useState('')
  const [pendingRecordingData, setPendingRecordingData] = useState(null)
  const [recordingNotice, setRecordingNotice] = useState('')
  const [keepsakeNotice, setKeepsakeNotice] = useState('')

  const handleGenerateTopicQuestions = async (p1, p2, s, topic) => {
    setTopicError('')
    setRecordingNotice('')
    setStep('loading-topics')
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          person1Name: p1.name,
          person1City: p1.city,
          person1Country: p1.country,
          person1Occupation: p1.occupation,
          person2Name: p2.name,
          person2City: p2.city,
          person2Country: p2.country,
          person2Occupation: p2.occupation,
          setting: s,
          topics: [{ id: topic.id, name: topic.name }],
        }),
      }).finally(() => clearTimeout(timeout))
      if (!res.ok) throw new Error('generation_failed')
      const data = await res.json()
      if (data.questions?.length) {
        const generated = data.questions[0]
        if (!generated?.question1 || !generated?.question2) throw new Error('Incomplete questions')
        setActiveTopic({
          ...topic,
          question1: generated.question1,
          question2: generated.question2,
        })
      } else {
        throw new Error('Insufficient questions')
      }
    } catch {
      const fallbackTopic = generateDemoQuestions(p1, p2, s, [topic])[0]
      setActiveTopic(fallbackTopic || {
        ...topic,
        question1: topic.question,
        question2: topic.question,
      })
      setRecordingNotice("Gemini didn't respond, so Halfway wrote a local opening to keep the conversation moving.")
    }

    setStep('recording')
  }

  const processConversation = async (recordingData) => {
    setProcessingError('')
    setKeepsakeNotice('')
    const save = (k, nextStep = 'reveal') => {
      onSave({
        id: `convo-${Date.now()}`,
        person1,
        person2,
        setting,
        topic: activeTopic,
        topics: activeTopic ? [activeTopic] : [],
        keepsake: k,
        createdAt: new Date().toISOString(),
      })
      setKeepsake(k)
      setStep(nextStep)
    }

    const attempt = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch('/api/summarize-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          audioBase64: recordingData.audioBase64,
          audioMimeType: recordingData.audioMimeType,
          transcript: recordingData.transcript,
          setting,
          topic: activeTopic ? { id: activeTopic.id, name: activeTopic.name, question1: activeTopic.question1, question2: activeTopic.question2 } : null,
          person1: { name: person1.name, city: person1.city, country: person1.country, occupation: person1.occupation },
          person2: { name: person2.name, city: person2.city, country: person2.country, occupation: person2.occupation },
        }),
      }).finally(() => clearTimeout(timeout))
      if (!res.ok) throw new Error('generation_failed')
      const data = await res.json()
      if (!data.thread) throw new Error('Invalid response')
      return data
    }

    try {
      save(await attempt())
    } catch {
      try {
        save(await attempt())
      } catch {
        const fallbackKeepsake = {
          ...FALLBACK_KEEPSAKE,
          ...generateDemoKeepsake(person1, person2, setting),
          transcript: recordingData.transcript || '',
        }
        setKeepsakeNotice("Gemini didn't return a halfway point, so Halfway used a local fallback to preserve the moment.")
        save(fallbackKeepsake)
      }
    }
  }

  const handleRecordingFinish = async (recordingData) => {
    if (recordingData.discard) {
      setActiveTopic(null)
      setSelectedTopic(null)
      setPendingRecordingData(null)
      setRecordingNotice('')
      setKeepsakeNotice('')
      setStep('topic')
      return
    }

    setRecordingNotice('')
    if (recordingData.audioBlob) {
      const url = URL.createObjectURL(recordingData.audioBlob)
      setAudioUrl(url)
    }

    setPendingRecordingData(recordingData)
    setStep('processing')
    await processConversation(recordingData)
  }

  const loadingDots = (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-terracotta/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
      <p className="font-serif italic text-brown-deep/40 text-sm">
        {step === 'loading-topics' ? 'Writing your first two questions…' : 'Finding your halfway point…'}
      </p>
    </div>
  )

  const revealLine = keepsake?.thread || FALLBACK_KEEPSAKE.thread
  const revealPrompt = keepsake?.continuePrompt || 'Stay with this for a second before you move on.'

  const showHeader = step !== 'recording'

  return (
    <div className="h-screen bg-parchment flex flex-col overflow-hidden">
      {showHeader && (
        <div className="shrink-0 flex items-center px-6 py-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span className="font-serif text-xl font-bold text-brown-deep">Halfway</span>
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {step === 'setting' && (
          <motion.div key="setting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
            <SettingPicker onConfirm={(s) => { setSetting(s); setStep('who-them') }} />
          </motion.div>
        )}

        {step === 'who-them' && (
          <motion.div key="who-them" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0">
            <ProfileSetup
              initialProfile={person2}
              heading="Tell us about them"
              subtitle="Use the same one-screen setup you used for yourself, so the conversation can begin without extra steps."
              accentColor="sage"
              namePlaceholder="Their first name"
              occupationPlaceholder="What do they do? (e.g. grad student, nurse, software engineer)"
              countryHint="Tap the map or search for their country."
              submitLabel="Continue →"
              secondaryActionLabel={initialPerson2 ? undefined : 'Try with an example person →'}
              onSecondaryAction={initialPerson2 ? undefined : () => {
                const demo = { name: 'Sarah', country: 'Canada', city: 'Toronto', occupation: 'student', isDemo: true }
                setPerson2(demo)
                setStep('topic')
              }}
              onDone={(profile) => {
                const p2 = { ...person2, ...profile }
                setPerson2(p2)
                setStep('topic')
              }}
            />
          </motion.div>
        )}

        {step === 'topic' && (
          <motion.div key="topic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto">
            <div className="min-h-screen bg-parchment px-6 py-10 space-y-6 max-w-3xl mx-auto">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-brown-deep">
                  Pick one topic to open the conversation
                </h1>
                <p className="text-brown-deep/55 text-sm md:text-base italic max-w-xl">
                  Halfway will write one question for {person1.name || 'you'} and one for {person2.name || 'them'} around the same topic, then listen for the thread between your answers.
                </p>
              </div>

              <div className="grid gap-3">
                {TOPIC_OPTIONS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setSelectedTopic(topic.id)
                      handleGenerateTopicQuestions(person1, person2, setting, topic)
                    }}
                    className="w-full text-left rounded-2xl border p-5 transition-transform hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${topic.color}14 0%, #EDE5D0 65%)`,
                      borderColor: `${topic.color}30`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <p className="font-serif text-xl font-bold text-brown-deep">{topic.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-brown-deep/35">One shared starting point</p>
                      </div>
                    </div>
                    <p className="font-serif italic text-brown-deep/70 leading-relaxed">{topic.question}</p>
                    {selectedTopic === topic.id && (
                      <p className="text-sm text-brown-deep/50 mt-3">Writing your questions…</p>
                    )}
                  </button>
                ))}
              </div>
              {topicError && (
                <div className="rounded-2xl border border-terracotta/20 bg-terracotta/10 px-4 py-3 text-sm text-brown-deep/75">
                  {topicError}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {(step === 'loading-topics' || step === 'processing') && (
          <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
            {loadingDots}
          </motion.div>
        )}

        {step === 'processing-error' && (
          <motion.div key="processing-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-5">
            <div className="max-w-md space-y-3">
              <h2 className="font-serif text-3xl font-bold text-brown-deep">Gemini did not return a halfway point.</h2>
              <p className="text-brown-deep/60 leading-relaxed">
                {processingError}
              </p>
            </div>
            <button
              onClick={() => {
                if (!pendingRecordingData) return
                setStep('processing')
                processConversation(pendingRecordingData)
              }}
              className="w-full max-w-sm bg-brown-deep text-parchment py-4 rounded-2xl font-semibold hover:bg-brown-deep/90 transition-colors"
            >
              Retry with Gemini
            </button>
            <button
              onClick={() => setStep('recording')}
              className="text-brown-deep/45 text-sm hover:text-brown-deep/70 transition-colors"
            >
              Back to recording
            </button>
          </motion.div>
        )}

        {step === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
            <RecordingScreen
              topic={activeTopic}
              person1={person1}
              person2={person2}
              setting={setting}
              isDemo={Boolean(person1.isDemo || person2.isDemo)}
              statusNote={recordingNotice}
              onFinish={handleRecordingFinish}
              onClose={onClose}
            />
          </motion.div>
        )}

        {step === 'reveal' && keepsake && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="min-h-screen bg-parchment px-6 py-10 flex items-center justify-center">
              <div className="w-full max-w-2xl space-y-6 text-center">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta/70">The Halfway Point</p>
                  <h1 className="font-serif text-3xl md:text-5xl font-bold text-brown-deep leading-tight">
                    Something real opened here.
                  </h1>
                  <p className="font-serif italic text-brown-deep/55 leading-relaxed max-w-xl mx-auto">
                    Halfway listened for the one thread worth carrying forward.
                  </p>
                </div>

                {keepsakeNotice && (
                  <div className="rounded-2xl border border-amber-300/60 bg-amber-50/70 px-4 py-3 text-sm text-brown-deep/75">
                    {keepsakeNotice}
                  </div>
                )}

                <div className="rounded-[28px] border border-terracotta/20 bg-terracotta/10 px-6 py-8 md:px-10 md:py-10 space-y-5">
                  <div className="w-12 h-px bg-terracotta/35 mx-auto" />
                  <p className="font-serif italic text-brown-deep text-2xl md:text-3xl leading-relaxed">
                    "{revealLine}"
                  </p>
                  <p className="text-sm text-brown-deep/50 leading-relaxed max-w-lg mx-auto">
                    {revealPrompt}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setStep('keepsake')}
                    className="w-full max-w-sm bg-brown-deep text-parchment py-4 rounded-2xl font-semibold hover:bg-brown-deep/90 transition-colors"
                  >
                    See the full keepsake
                  </button>
                  <p className="text-xs text-brown-deep/35 italic">
                    The thread first. The fuller reflection next.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'keepsake' && keepsake && (
          <motion.div key="keepsake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto">
            <KeepsakeSummary
              keepsake={keepsake}
              topic={activeTopic}
              setting={setting}
              person1={person1}
              person2={person2}
              audioUrl={audioUrl}
              entryNote={keepsakeNotice}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
