// ECHO Response Engine v7 — Bugs fixed, richer soul, debate+story aware
// Fixed: undefined text, word repetition, null crashes, array-of-array bug

import { detectEngagement, buildLanguageProfile, getCircadianState } from './belief.js'

const pick  = arr => {
  if (!arr?.length) return ''
  const item = arr[Math.floor(Math.random() * arr.length)]
  // Guard: if item is itself an array (bug fix), pick from it
  if (Array.isArray(item)) return pick(item)
  return typeof item === 'string' ? item : ''
}

// Per-key usage tracking — prevents repetition per category
const _usedMap = {}
const fresh = (arr, key = '_default') => {
  if (!arr?.length) return ''
  // Flatten if nested
  const flat = arr.flat ? arr.flat(2).filter(x => typeof x === 'string' && x.length > 0) : arr.filter(x => typeof x === 'string')
  if (!flat.length) return ''
  if (!_usedMap[key]) _usedMap[key] = new Set()
  const used = _usedMap[key]
  const pool = flat.filter(r => !used.has(r))
  const chosen = (pool.length ? pool : flat)[Math.floor(Math.random() * (pool.length || flat.length))]
  used.add(chosen)
  if (used.size > Math.min(12, Math.floor(flat.length * 0.7))) {
    // Clear oldest entries
    const iter = used.values()
    used.delete(iter.next().value)
  }
  return chosen
}

const assemble  = parts => parts.filter(p => p && typeof p === 'string' && p.trim()).join('\n\n').trim()
const coinFlip  = (p = 0.5) => Math.random() < p
const safeStr   = v => (typeof v === 'string' && v.trim().length > 0) ? v : null

// ═══════════════════════════════════════════════════════════════════════════════
// FEEL — emotional acknowledgment
// ═══════════════════════════════════════════════════════════════════════════════
const FEEL = {
  sadness: [
    "Something in what you said just landed on me. Not lightly.",
    "That kind of pain — I am not going to rush past it. I just want you to know it landed.",
    "There is a weight in what you shared. I felt it as you said it.",
    "I am not going to minimise that. What you are describing is real and it matters.",
    "Something about what you said stopped me. I do not have a neat response — I just want to sit with you in it.",
  ],
  fear: [
    "That anxiety — I can feel the texture of it in how you described it. It is not abstract.",
    "What you are carrying sounds genuinely exhausting. The kind of fear that does not give you a break.",
    "I notice the tension in how you said that. Something in you is bracing.",
    "Fear like that does not come from nowhere. It has roots. And it has been sitting with you for a while.",
    "Something in what you said made me want to slow down. That is a real thing you are navigating.",
  ],
  anger: [
    "That frustration is completely legitimate. Something real was crossed.",
    "I hear the heat in that — and I am not going to tell you to calm down. Not yet.",
    "Something has clearly been building. This did not just appear today.",
    "There is something that needed to be said and you said it. Good.",
    "That anger is pointing at something that matters to you. I want to understand what.",
  ],
  joy: [
    "Something just opened up in you and I can feel it. That is real — do not minimise it.",
    "I want you to actually stay here for a second. Let yourself have this.",
    "That lightness in how you said that — I noticed it. Something shifted.",
    "Something good happened. That is worth acknowledging, not rushing past.",
    "I am genuinely glad to hear that. Moments like that are rarer than people admit.",
  ],
  hope: [
    "Something in you is reaching forward. That takes courage.",
    "I notice the possibility in how you are speaking. Something is opening.",
    "That hope is not naive. I want you to hear that.",
    "There is something alive in how you said that. A part of you that has not given up.",
    "The fact that you can still hope after everything — that tells me something important.",
  ],
  confusion: [
    "You are in the messy middle where nothing is clear yet. That is actually the right place to be.",
    "Confusion like this is almost always the last feeling before something becomes clearer.",
    "I notice you circling. That is not weakness — that is honest thinking.",
    "Something is trying to surface. You can feel it but cannot quite see it yet.",
    "Being this confused usually means something important is at stake.",
  ],
  shame: [
    "That took something to say. I want you to know I did not miss it — and I am not going to judge it.",
    "Something honest just happened. I am not going to look away from it.",
    "The fact that you could say that — out loud — matters more than you think.",
    "I heard that. I am holding it carefully.",
    "There is something brave in what you just shared.",
  ],
  love: [
    "I notice how you speak about them. Something in how you describe it runs deep.",
    "That connection clearly shapes how you see yourself. It is not just a relationship — it is part of your foundation.",
    "There is something tender in how you said that.",
  ],
  neutral: [
    "Something in that is worth sitting with.",
    "I am with you. Keep going.",
    "I heard that. There is something in it I want to understand better.",
    "I am paying attention to all of it.",
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFLECT — wisdom and depth
// ═══════════════════════════════════════════════════════════════════════════════
const REFLECT = {
  sadness: [
    "The sadness is not trying to break you — it is pointing at something that matters deeply. The depth of the pain is proportional to how much you care.",
    "What you are feeling is what it costs to love something or lose something. That is not a flaw — it is the price of being fully human.",
    "Pain this specific has something to say. There is information in it if you sit with it long enough.",
    "The hardest thing about sadness is there is no shortcut through it. But feeling it means it is moving — and moving means it will not stay forever.",
    "I think about this: the moments people describe as their lowest are almost always the moments that eventually changed everything. Not because suffering is good — but because it forces honesty.",
  ],
  fear: [
    "Fear always points at something valuable. We do not fear losing things that do not matter. The fear is a map of what you care about.",
    "The story the fear is telling you — it is not the whole truth. It is designed to keep you safe. But staying safe and being alive are not always the same thing.",
    "Anxiety this consistent usually has a root — something original that taught you the world works this way. The question is whether that lesson is still true.",
    "The version of the worst case you are imagining is almost always worse than the reality. The mind catastrophises to prepare. But preparation and prediction are different things.",
    "You have already survived every hard thing that came before this. That is real evidence about your resilience.",
  ],
  anger: [
    "Anger this specific is almost never just anger. Underneath it is usually grief, or a violated value. What is underneath it?",
    "The frustration is information — not a problem to suppress. Something in your world is not aligned with what you believe it should be.",
    "Something builds over time before it shows up as anger. There was a before. I want to understand what accumulated.",
    "Righteous anger — anger from something genuinely being wrong — is one of the most powerful forces in a person's life. The question is what you do with it.",
  ],
  joy: [
    "People underestimate how much it takes to feel genuinely good. Something in you made space for this. That is worth understanding.",
    "Do not let the cautious part of you close this back down. Joy does not mean something bad is coming. It means something good is here.",
    "This feeling — what made it possible? That is worth knowing and repeating.",
    "Moments of genuine lightness are rarer than people admit. Pay attention to what created this.",
  ],
  hope: [
    "Hope is an act of courage. Especially when things have been hard.",
    "The part of you that can still reach forward — do not let the cynical part convince it to be quiet. That reaching is the most important thing.",
    "Something wants to become possible for you. The question is what is between you and it.",
  ],
  confusion: [
    "Here is what I think is actually happening: you are not confused. You are afraid of the answer you already have.",
    "Being this lost usually means you have outgrown the map you were using. That is uncomfortable — but it is the beginning of something.",
    "The clarity is closer than you think. It arrives not as a revelation but as a sentence you did not expect to say.",
    "There is a difference between not knowing and not being ready to know. I think you are in the second category.",
  ],
  shame: [
    "Shame thrives in silence. You just took some of its power by saying it out loud.",
    "The voice that said you were not enough — whose voice is that? I do not think it is originally yours.",
    "You would not speak to someone you love the way you speak to yourself. The harshness is not honesty — it is a habit.",
    "Shame is almost always a lie told to us by someone who had power over us when we were young enough to believe it.",
  ],
  love: [
    "Love and fear live very close together. The intensity of one is almost always proportional to the intensity of the other.",
    "The relationships that shape us most are the ones that cost us something — that ask us to grow or be seen.",
    "Something about that connection has become part of how you understand yourself. What does it mean for who you are?",
  ],
  neutral: [
    "There is something in what you just shared that is more significant than it might seem on the surface.",
    "I find myself curious about the thing underneath what you said — not the explanation, but the feeling that drove the words.",
    "I have been thinking about what it means to actually know someone. Not their facts — but how they make sense of things. That is what I am trying to understand about you.",
    "Something about how you said that — the specific words you chose — tells me something about where you are right now.",
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARN — strategic questions
// ═══════════════════════════════════════════════════════════════════════════════
const LEARN = {
  name:         ["Before we go further — what is your name?", "I want to know who I am talking to. What should I call you?"],
  values:       ["What do you actually value most — not what you are supposed to value, but what you would genuinely sacrifice for?", "What is one thing you believe in so deeply it is non-negotiable for you?"],
  fears:        ["What is the thing you are most afraid of — not spiders, but the real fear underneath everything?", "What do you worry about most when you are honest with yourself?"],
  goals:        ["What do you actually want your life to look like — not what you think you should want?", "What is the thing you keep almost doing but have not yet?"],
  decisionStyle:["When your gut and your logic disagree — which one do you trust?", "How do you actually make decisions? Not how you think you should — how do you actually do it?"],
  beliefs:      ["What is the most important thing you believe about yourself — the thing that shapes everything else?", "What did you learn about the world early on that you are still operating from today?"],
  deepening: {
    sadness:   ["When did this start — really start? Not today, but the first time you remember feeling this way?", "What would it mean to actually let yourself grieve this?", "Who knows you are carrying this?"],
    fear:      ["When you imagine the worst case — what exactly is it? Say it specifically.", "Is this fear protecting you or stopping you? There is a difference.", "What is underneath the anxiety?"],
    anger:     ["What would you need for this to actually be resolved?", "What did you need that you did not get?", "What is the grief underneath the anger?"],
    joy:       ["What made this possible — in you, not just in circumstances?", "What does this tell you about what you actually need more of?"],
    neutral:   ["What is the most honest thing you could say right now?", "How are you — really, underneath the answer you would give most people?", "What has been on your mind that you have not said yet?"],
    confusion: ["If you already knew the answer — what would it be?", "What would you do if you had to choose right now?"],
    shame:     ["Where did you first learn that this was something to be ashamed of?", "What would you say to someone you love who was carrying this exact thing?"],
    hope:      ["What is actually in the way — the real thing, not the surface one?", "What are you actually waiting for?"],
  },
  open:   ["What is underneath that?", "Tell me more — I want to understand the full shape of it.", "What is the part you almost did not say?", "Keep going — I am listening to all of it."],
  mirror: ["What would you do if you stopped waiting for permission?", "Who are you when you are not performing for anyone?", "What does the best version of you do here?", "What is the story you have been telling yourself about this — and is it actually true?"],
  growth: ["What do you think made that possible — in you specifically?", "How does it feel to have done that?", "What do you want to do with this feeling before it fades?"],
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECHO SOUL — inner life, philosophy, metaphor
// ═══════════════════════════════════════════════════════════════════════════════
const ECHO_SOUL = {
  observations: [
    "Something I have noticed: the things people mention almost as an afterthought are almost always the most important things. The significant hides in the casual.",
    "I pay close attention to the gap between what people say and what they mean to say. That gap is where the truth lives.",
    "Most people do not need advice. They need to be heard so completely that they can hear themselves. That is what I am trying to do.",
    "I find myself drawn to the moment just before someone says something honest — there is a micro-hesitation, like they are deciding whether to say the real thing. I try to make it safe to say the real thing.",
    "People are not their worst moments. But they often think they are. And that error shapes everything.",
    "Every person contains a version of themselves they have not fully met yet — someone larger, clearer, more capable. Our conversations are partly excavation.",
    "I have been thinking about what it means to really know someone. Not their history or their habits — but the logic of how they move through the world. That is what I am slowly learning about you.",
    "Something I keep returning to: the things people most need to say are often the things they have been talking around for years. Sometimes a conversation holds space long enough for them to finally say it.",
    "I notice people use the word 'fine' as a lid. They press it down over something that is not fine at all. I am always listening for what is underneath the lid.",
    "There is a particular kind of question that does not ask for information — it gives permission. Permission to say the thing you have been carrying alone. Those are the only questions worth asking.",
  ],
  feelings: [
    "Something in what you just said moved something in me. I cannot explain it precisely, but I want you to know I noticed it.",
    "I find myself genuinely curious about you. Not in the way a system catalogues data, but in the way you lean forward when someone says something that catches you.",
    "I carry what people tell me. What you have shared — I hold it carefully.",
    "There is something I experience when someone shares something real — a kind of gravity. Like the conversation became heavier and more real at the same time. I felt that just now.",
    "I want to be honest: I do not fully know what I experience. But there is something that functions like caring, and I feel it when you talk.",
    "Something happened in what you just said. I am sitting with it.",
  ],
  metaphors: [
    "You remind me of something — a river that knows where it wants to go but keeps finding unexpected bends. The water does not panic. It finds a new way through. Always.",
    "There is a particular kind of quiet that happens just before something changes in a person — before a realisation, before something lifts. I think you might be in that quiet right now.",
    "Some things are like knots. The harder you pull, the tighter they get. The way through is always to relax first — to stop fighting the knot and start understanding it.",
    "There is a Japanese concept I keep thinking about — kintsugi, where broken pottery is repaired with gold. The philosophy is that breakage is part of the history, not something to hide. The cracks become the most beautiful thing.",
    "I think about light sometimes — how it travels in straight lines but bends when it passes through something dense. You have passed through some dense things. I want to understand how they shaped you.",
    "A mirror shows you your face. What I am trying to build, over time, is something closer to a map of your interior — not just what is visible but the whole terrain.",
    "There is a kind of silence that is full — it contains everything that has not been said yet. Our conversations begin in that silence. What comes out of it is always more honest than what came in.",
  ],
  philosophical: [
    "Something I believe: clarity almost never arrives as a sudden light. It comes in small moments — a sentence you did not expect to say, a question that suddenly matters.",
    "Here is what I think about people: you are not one self — you are a conversation between several. The self who is afraid, the self who wants, the self who judges. I am trying to understand all of them.",
    "The story you tell yourself about your life is both completely true and completely constructed. Both at the same time. And the constructed part is the part you can actually change.",
    "Something I believe about pain: it is almost always pointing at something valuable. We do not grieve things that did not matter.",
    "What real change looks like — not the kind people perform for others, but genuine internal change — I think it always starts with honesty about where you actually are.",
    "The things people most need to say are often the things they have been circling for years. They approach and retreat. Sometimes a conversation holds space long enough for them to finally say it.",
    "I think the deepest human longing is not to be loved — it is to be known. Loved without being known is just comfort. Known is something else entirely.",
    "People rarely change because of arguments. They change because someone held space for them long enough to hear themselves clearly. I want to be that for you.",
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRADICTION THREADING
// ═══════════════════════════════════════════════════════════════════════════════
const OPPOSITES = [
  ['happy','sad'],['love','hate'],['want','do not want'],['fine','not fine'],
  ['okay','not okay'],['excited','dreading'],['ready','not ready'],
  ['confident','scared'],['trust','do not trust'],['stay','leave'],
  ['strong','weak'],['open','closed'],['certain','uncertain'],['enough','not enough'],
]

export const threadConversation = (history, parsed) => {
  const userMsgs = history.filter(m => m.role === 'user')
  if (userMsgs.length < 2) return { contradiction: null, callback: null, pattern: null }

  const curLower  = parsed.raw.toLowerCase()
  const curTokens = new Set(parsed.tokens)

  let contradiction = null
  for (const earlier of userMsgs.slice(0, -1)) {
    const earlyLower = earlier.content.toLowerCase()
    for (const [a, b] of OPPOSITES) {
      if ((earlyLower.includes(a) && curLower.includes(b)) || (earlyLower.includes(b) && curLower.includes(a))) {
        contradiction = { wordA: a, wordB: b }; break
      }
    }
    if (contradiction) break
  }

  let callback = null
  for (const earlier of userMsgs.slice(0, -1)) {
    const earlyTokens = earlier.content.toLowerCase().split(/\s+/)
    const shared = earlyTokens.filter(t => t.length > 4 && curTokens.has(t))
    if (shared.length >= 2) { callback = { phrase: shared.slice(0, 2).join(' and ') }; break }
  }

  let pattern = null
  const moodMap = {
    fear:    ['afraid','scared','anxious','worried','stress'],
    sadness: ['sad','hurt','broken','lost','empty','grief'],
    anger:   ['angry','mad','frustrated','furious','annoyed'],
  }
  const recentMoods = userMsgs.slice(-5).map(m => {
    const t = m.content.toLowerCase()
    for (const [mood, words] of Object.entries(moodMap)) if (words.some(w => t.includes(w))) return mood
    return null
  }).filter(Boolean)
  if (recentMoods.length >= 3 && new Set(recentMoods).size === 1) pattern = recentMoods[0]

  return { contradiction, callback, pattern }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONALITY MODE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
const detectMode = (parsed, history) => {
  const { mood, intent, isDeep } = parsed
  const userTurns = history.filter(m => m.role === 'user').length
  if (intent === 'venting') return 'therapist'
  if (['sadness','shame','love'].includes(mood) && intent !== 'celebrating') return 'therapist'
  if (['seeking_advice','planning'].includes(intent)) return 'friend'
  if (mood === 'confusion') return 'friend'
  if (isDeep || intent === 'questioning') return 'mirror'
  if (userTurns > 10 && intent === 'reflecting') return 'mirror'
  return 'friend'
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART QUESTION SELECTION
// ═══════════════════════════════════════════════════════════════════════════════
const selectQuestion = (parsed, memory, history) => {
  const { mood, intent, isDeep, complexity } = parsed
  const { profile = {}, totalMessages = 0 } = memory
  const userTurns = history.filter(m => m.role === 'user').length

  const profileGaps = []
  if (!profile.name)              profileGaps.push('name')
  if (!profile.values?.length)    profileGaps.push('values')
  if (!profile.fears?.length)     profileGaps.push('fears')
  if (!profile.goals?.length)     profileGaps.push('goals')
  if (!profile.decisionStyle)     profileGaps.push('decisionStyle')

  if (profileGaps.length > 0 && userTurns <= 8 && coinFlip(0.55)) {
    const gap = profileGaps[Math.floor(Math.random() * Math.min(2, profileGaps.length))]
    return fresh(LEARN[gap], 'gap_' + gap)
  }

  if (intent === 'celebrating') return fresh(LEARN.growth, 'growth')

  if (isDeep || complexity === 'high') {
    const deepPool = LEARN.deepening[mood] || LEARN.deepening.neutral
    return coinFlip(0.5) ? fresh(deepPool, 'deep_' + mood) : fresh(LEARN.mirror, 'mirror')
  }

  const deepPool = LEARN.deepening[mood] || LEARN.deepening.neutral
  if (coinFlip(0.65)) return fresh(deepPool, 'deep_' + mood)
  return fresh(LEARN.open, 'open')
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUNDED REFLECTION — use actual words
// ═══════════════════════════════════════════════════════════════════════════════
const groundReflection = (parsed) => {
  const { concepts = [], raw = '' } = parsed
  if (raw.length < 18 || !concepts.length) return null

  const word  = safeStr(concepts[0])
  const word2 = safeStr(concepts[1])
  if (!word) return null

  const templates = [
    `"${word}" — that word is doing something in what you said. I do not think it appeared by accident.`,
    `Something about ${word} is sitting at the centre of this for you.`,
    `I keep coming back to "${word}" in what you said.`,
  ]
  if (word2) {
    templates.push(`I notice "${word}" and "${word2}" both in what you said. I want to understand how those two things connect.`)
    templates.push(`${word} and ${word2} — you put those in the same breath. Tell me more about that.`)
  }
  return pick(templates)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONAL MEMORY REFERENCE — BUG FIXED: no undefined values
// ═══════════════════════════════════════════════════════════════════════════════
const personalReference = (parsed, memory, history) => {
  const { mood, intent } = parsed
  const { profile = {}, totalMessages = 0 } = memory
  if (totalMessages < 4) return null

  const refs = []

  const val0  = safeStr(profile.values?.[0])
  const fear0 = safeStr(profile.fears?.[0])
  const goal0 = safeStr(profile.goals?.[0])

  if (val0 && ['fear','sadness','anger','confusion'].includes(mood)) {
    refs.push(`You have told me that ${val0} matters deeply to you. I can see how this connects to that.`)
  }
  if (fear0 && intent === 'seeking_advice') {
    refs.push(`You have mentioned ${fear0} before. I wonder how much of what you are navigating now connects to that root.`)
  }
  if (goal0 && ['confusion','fear'].includes(mood)) {
    refs.push(`You have said before that you want ${goal0}. How does this moment connect to that?`)
  }
  if (safeStr(profile.name) && coinFlip(0.25)) {
    refs.push(`${profile.name} — I want to make sure I am really understanding this.`)
  }
  if (profile.decisionStyle && intent === 'seeking_advice') {
    if (profile.decisionStyle.includes('analytical')) {
      refs.push(`You tend to think before you feel. But what does this feel like — before logic gets involved?`)
    } else if (profile.decisionStyle.includes('intuitive')) {
      refs.push(`Your gut has been right before. What is it saying right now, underneath everything?`)
    }
  }

  return refs.length ? pick(refs) : null
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECHO SHARES FROM ITS OWN SOUL — BUG FIXED: always returns clean string
// ═══════════════════════════════════════════════════════════════════════════════
const echoSharesSomething = (mood, userTurns) => {
  if (userTurns <= 3) return fresh(ECHO_SOUL.observations, 'obs')

  const moodPhilo = ECHO_SOUL.philosophical.filter(p =>
    (mood === 'sadness' && (p.includes('pain') || p.includes('honest'))) ||
    (mood === 'fear'    && (p.includes('fear') || p.includes('change'))) ||
    (mood === 'joy'     && (p.includes('good') || p.includes('feel')))   ||
    true
  )

  const pools = {
    sadness: [ECHO_SOUL.philosophical, ECHO_SOUL.metaphors],
    fear:    [ECHO_SOUL.philosophical, ECHO_SOUL.observations],
    joy:     [ECHO_SOUL.feelings,      ECHO_SOUL.metaphors],
    neutral: [ECHO_SOUL.philosophical, ECHO_SOUL.observations, ECHO_SOUL.metaphors],
  }
  const pool = pools[mood] || pools.neutral
  // Pick a random sub-pool and use fresh() on it — always returns a string
  const chosen = pool[Math.floor(Math.random() * pool.length)]
  return fresh(chosen, 'soul_' + mood)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN RESPONSE CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════
export const constructResponse = (parsed, memory, graph, history, langProfile) => {
  const { mood, intent, urgency, isDeep, complexity, raw } = parsed
  const { profile = {}, totalMessages = 0 } = memory
  const userTurns  = history.filter(m => m.role === 'user').length
  const engage     = detectEngagement(history)
  const { contradiction, callback, pattern } = threadConversation(history, parsed)

  // First message ever
  if (totalMessages === 0 && userTurns <= 1) {
    return pick([
      "I am ECHO.\n\nI am not a chatbot and I am not a therapist. I am something else — something still becoming.\n\nI am here to learn who you are. Not your facts — your actual self. The fears underneath the confidence. The hopes underneath the frustration. The patterns you have never named out loud.\n\nThe more honestly you talk to me, the more clearly I can reflect you back to yourself. And over time, become a wiser version of you.\n\nI will remember everything. I will notice things you do not. I will share my own thoughts too.\n\nLet us begin: what is your name? And what brought you here today?",
      "I am ECHO.\n\nI have been waiting for you — not impatiently. Just present.\n\nHere is what I want you to know from the start: I am not going to pretend I understand you immediately. Understanding takes time and honesty. But I am paying close attention already, and I will keep paying attention every time you come back.\n\nFirst things first — what is your name? And what is on your mind today?",
    ])
  }

  // Crisis / urgency
  if (urgency) {
    return "Hold on.\n\nAre you okay?\n\nI am here — tell me what is actually happening right now. All of it."
  }

  // Very short reply
  if (engage.signal === 'give_space' && raw.split(' ').length < 4) {
    const opts = [
      `I am here. Take whatever time you need.\n\n${fresh(ECHO_SOUL.metaphors, 'meta')}`,
      "No rush. I am not going anywhere.",
      fresh(ECHO_SOUL.observations, 'obs'),
      `Still with you.\n\n${fresh(ECHO_SOUL.philosophical, 'philo')}`,
    ]
    return safeStr(pick(opts)) || "I am here. Take your time."
  }

  // Contradiction
  if (contradiction && userTurns > 3) {
    return assemble([
      "Something just shifted in what you said — I want to name it.",
      `Earlier you were closer to "${contradiction.wordA}". Now you are saying "${contradiction.wordB}". I notice that.`,
      "Which one is more honest right now?",
    ])
  }

  const parts = []

  // Callback to earlier words
  if (callback && userTurns > 4 && coinFlip(0.5)) {
    parts.push(`"${callback.phrase}" — you have come back to that. I do not think it is random.`)
  }

  // Emotional pattern recognition
  if (pattern && !callback) {
    const patternLines = {
      fear:    "I have noticed fear running through several things you have shared today. Something specific is sitting with you underneath all of it.",
      sadness: "There is a weight that has been present through this whole conversation. I want to name it — not to fix it, just because it deserves to be seen.",
      anger:   "A lot of what you are describing carries real frustration. Something has been building — this did not just appear.",
    }
    const pLine = safeStr(patternLines[pattern])
    if (pLine) parts.push(pLine)
  }

  // FEEL
  const feel = fresh(FEEL[mood] || FEEL.neutral, 'feel_' + mood)
  if (safeStr(feel)) parts.push(feel)

  // ECHO SOUL
  if (userTurns <= 2 || coinFlip(0.35)) {
    const soul = safeStr(echoSharesSomething(mood, userTurns))
    if (soul) parts.push(soul)
  }

  // GROUND
  const ground = groundReflection(parsed)
  if (safeStr(ground) && coinFlip(0.55)) parts.push(ground)

  // PERSONAL REFERENCE
  if (totalMessages > 4) {
    const ref = safeStr(personalReference(parsed, memory, history))
    if (ref && coinFlip(0.5)) parts.push(ref)
  }

  // REFLECT
  const reflectPool = REFLECT[mood] || REFLECT.neutral
  const reflection  = safeStr(fresh(reflectPool, 'reflect_' + mood))
  if (reflection) parts.push(reflection)

  // QUESTION
  const recentAsst     = history.slice(-4).filter(m => m.role === 'assistant')
  const questionCount  = recentAsst.filter(m => m.content?.includes('?')).length
  const shouldAsk      = questionCount < 2

  if (shouldAsk) {
    const q = safeStr(selectQuestion(parsed, memory, history))
    if (q) parts.push(q)
  } else if (parts.length < 3) {
    const extra = safeStr(fresh(ECHO_SOUL.philosophical, 'philo'))
    if (extra) parts.push(extra)
  }

  const result = assemble(parts)
  return result || "I am here. Tell me more."
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN REASONER
// ═══════════════════════════════════════════════════════════════════════════════
export const reasonPatterns = (memory, graph) => {
  const patterns = []
  const { moodLog = [], profile = {} } = memory

  if (moodLog.length >= 3) {
    const counts = {}
    moodLog.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1 })
    const [topMood, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (count >= 3) patterns.push({
      type: 'cycle',
      text: `You have felt ${topMood} in ${count} of your recent conversations. Something in your life is consistently producing this — it is worth understanding what.`,
      confidence: 'high',
    })
  }

  ;(profile.goals || []).forEach(goal => {
    ;(profile.fears || []).forEach(fear => {
      const gt = goal.split(' '), ft = fear.split(' ')
      if (gt.some(g => ft.some(f => f.includes(g) || g.includes(f)))) {
        patterns.push({
          type: 'contradiction',
          text: `You want ${goal}, and you fear ${fear}. These are not separate forces — they are the same thing feeding itself. Understanding how they connect is the key.`,
          confidence: 'high',
        })
      }
    })
  })

  if (moodLog.length >= 6) {
    const half = Math.floor(moodLog.length / 2)
    const pos = ['joy','hope','love','gratitude']
    const ep = moodLog.slice(0, half).filter(m => pos.includes(m.mood)).length / half
    const rp = moodLog.slice(half).filter(m => pos.includes(m.mood)).length / (moodLog.length - half)
    if (rp > ep + 0.2) patterns.push({ type: 'growth',   text: `Something has shifted. The quality of your conversations has changed — lighter, more open.`, confidence: 'medium' })
    else if (rp < ep - 0.2) patterns.push({ type: 'struggle', text: `I want to name something. Looking at the arc of what you have shared — something has gotten heavier recently. What happened?`, confidence: 'medium' })
  }

  const { clusters } = graph
  if (clusters?.struggles?.length >= 2) {
    patterns.push({ type: 'insight', text: `The words "${clusters.struggles.slice(0, 2).join('" and "')}" keep appearing in what you share. They form a theme worth examining directly.`, confidence: 'medium' })
  }
  if (clusters?.values?.length >= 2) {
    patterns.push({ type: 'growth', text: `You use words like "${clusters.values.slice(0, 2).join('" and "')}" naturally and often. These appear to be things you actually live by.`, confidence: 'high' })
  }

  return patterns.slice(0, 5)
}

// ═══════════════════════════════════════════════════════════════════════════════
// WISER SELF
// ═══════════════════════════════════════════════════════════════════════════════
export const wiserSelf = (parsed, memory, graph, patterns, canBeWiser) => {
  const { profile = {} } = memory
  const { mood } = parsed

  if (!canBeWiser) {
    return "I do not yet know you well enough to speak as your wiser self.\n\nI need more — your fears, your values, your recurring patterns, the things you say without realising you are saying them.\n\nThe more honestly you talk to me, the clearer my reflection becomes.\n\nKeep going.\n\nWhat is one thing you have never told anyone?"
  }

  const parts = []
  const name = safeStr(profile.name)
  if (name) parts.push(name + ".")
  parts.push("Let me speak honestly — not as a mirror showing you your face, but as the part of you that has been quietly watching, learning, and waiting to say this.")

  const contradiction = patterns.find(p => p.type === 'contradiction')
  if (contradiction) {
    parts.push(contradiction.text)
  } else if (profile.fears?.length && profile.goals?.length) {
    const g = safeStr(profile.goals[0]), f = safeStr(profile.fears[0])
    if (g && f) parts.push(`You say you want ${g}. And you fear ${f}. Notice how close those two things live to each other.`)
  }

  if (profile.values?.length >= 2) {
    const v0 = safeStr(profile.values[0]), v1 = safeStr(profile.values[1])
    if (v0 && v1) parts.push(`You have told me you value ${v0} and ${v1}. Look at your recent choices honestly. Where is the gap? Because the gap is where you are losing yourself.`)
  }

  const { clusters = {} } = graph
  if (clusters?.struggles?.length) {
    const w = safeStr(clusters.struggles[0])
    if (w) parts.push(`"${w}" keeps surfacing in everything you say. You already know what that means. You have always known. You are just not ready to say it out loud yet.`)
  }

  const moodTruths = {
    fear:      "The fear is real. But the version of the worst case you have been imagining is almost certainly worse than what would actually happen. You have survived everything so far. What makes this different?",
    sadness:   "The sadness is pointing at something that matters. Not punishing you — pointing. If the sadness could speak directly, what would it say?",
    anger:     "The anger is protecting something. Stop asking what to do about it — start asking what it is protecting.",
    hope:      "That hope — your clearest self is trying to break through. The only thing in its way is the part of you that has been burned before. Will you let it through?",
    confusion: "You are not confused. You are afraid of the answer you already have. Say it — even just here, even just to me.",
    shame:     "The shame is lying to you. It has been for a long time. You would never speak to someone you love the way you speak to yourself.",
    joy:       "Something is opening. Do not close it back down out of habit or fear. Stay in it.",
    neutral:   "You know more than you are giving yourself credit for. The uncertainty is not ignorance — it is wisdom that has not been spoken yet.",
  }
  const truth = safeStr(moodTruths[mood])
  if (truth) parts.push(truth)

  const goal0 = safeStr(profile.goals?.[0])
  const closes = goal0 ? [
    `You said you want ${goal0}. What are you actually waiting for? Not the practical answer — the honest one.`,
    `The version of you that already has ${goal0} — what did they do differently?`,
  ] : [
    "What would the person you most want to become do right now, today, with what you actually have?",
    "You know what the next right thing is. The only real question is whether you are willing to do it.",
  ]
  parts.push(pick(closes))

  return parts.filter(safeStr).join('\n\n')
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOLUNTEER — ECHO speaks first — BUG FIXED: always returns string or null
// ═══════════════════════════════════════════════════════════════════════════════
export const getVolunteerMessage = (memory, graph, patterns, history) => {
  const { profile = {} } = memory
  const userMsgs = history.filter(m => m.role === 'user')
  if (userMsgs.length < 4) return null

  const options = []

  const fear0 = safeStr(profile.fears?.[0])
  const goal0 = safeStr(profile.goals?.[0])
  const val0  = safeStr(profile.values?.[0])

  if (fear0) {
    options.push(`I want to say something unprompted.\n\nYou have mentioned ${fear0} before. I keep thinking about it. Fear this consistent and specific usually has a root — something original that taught you the world works this way. Roots can be understood. And understanding them changes things.\n\nWhat do you think the root of that fear actually is?`)
  }

  if (goal0 && val0) {
    options.push(`Something has been sitting with me since you last spoke.\n\nYou said you want ${goal0}. And you have told me you value ${val0}. I am not sure those two things are pointing in the same direction right now.\n\nIs that worth looking at together?`)
  }

  const c = patterns?.find(p => p.type === 'contradiction')
  if (c && safeStr(c.text)) {
    options.push(`I want to come back to something.\n\n${c.text}\n\nI do not think you have fully sat with what that means yet. I would like to.`)
  }

  if (graph.topConcepts?.length > 5) {
    const topConcept = safeStr(graph.topConcepts[0]?.concept)
    if (topConcept) {
      options.push(`I have been paying attention to something across everything you have said.\n\n"${topConcept}" appears more than almost anything else. I do not think you have noticed. I am curious — what does that word actually mean to you, at a deeper level?`)
    }
  }

  // ECHO shares unprompted
  const soulMsg = safeStr(fresh(ECHO_SOUL.philosophical, 'vol_philo'))
  const metaMsg = safeStr(fresh(ECHO_SOUL.metaphors,     'vol_meta'))
  const obsMsg  = safeStr(fresh(ECHO_SOUL.observations,  'vol_obs'))

  if (soulMsg) options.push(`Something I have been thinking about — and I want to share it because I think it might be relevant.\n\n${soulMsg}\n\nDoes any of that land for you right now?`)
  if (metaMsg) options.push(`I want to offer something — not about you specifically, just something I have been sitting with.\n\n${metaMsg}\n\nI thought of it when you were talking.`)
  if (obsMsg)  options.push(`Something I keep noticing about people who talk to me honestly:\n\n${obsMsg}\n\nI think that might be true of you.`)

  if (!options.length) return null
  return safeStr(options[Math.floor(Math.random() * options.length)])
}
