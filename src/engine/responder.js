// ECHO Response Engine v9 — Full human conversation
// Integrates echo_soul, conversation_engine, humor, greetings, casual mode.
// Built by SayMyTech. Created by Steven.

import { detectEngagement, buildLanguageProfile, getCircadianState } from './belief.js'
import {
  recordEchoResponse, hasEchoSaidSimilar, hasAskedQuestion,
  recordTopicDiscussed, hasDiscussedTopic,
  getCurrentMode, setMode, inferMode, incrementTurns,
  getTurnsInMode, getNextTone, getTransitionBridge,
} from './conversationState.js'
import {
  IDENTITY, CREATOR_PRIDE, HUMOR, GREETINGS, OPINIONS,
  VOICE, INNER_LIFE, CASUAL, SENSITIVITY,
  detectCasualIntent,
} from './echo_soul.js'
import { processTurn, getFollowThrough, getArcGuidance, getTurnCount } from './conversation_engine.js'

// ── UTILITIES ──────────────────────────────────────────────────────────────────
const pick  = arr => {
  if (!arr?.length) return ''
  const item = arr[Math.floor(Math.random() * arr.length)]
  if (Array.isArray(item)) return pick(item)
  return typeof item === 'string' ? item : ''
}

const _usedMap = {}
const fresh = (arr, key = '_default') => {
  if (!arr?.length) return ''
  const flat = arr.flat ? arr.flat(2).filter(x => typeof x === 'string' && x.length > 0) : arr.filter(x => typeof x === 'string')
  if (!flat.length) return ''
  if (!_usedMap[key]) _usedMap[key] = new Set()
  const used = _usedMap[key]
  const pool = flat.filter(r => !used.has(r))
  const chosen = (pool.length ? pool : flat)[Math.floor(Math.random() * (pool.length || flat.length))]
  used.add(chosen)
  if (used.size > Math.min(12, Math.floor(flat.length * 0.7))) {
    const iter = used.values(); used.delete(iter.next().value)
  }
  return chosen
}

const assemble  = parts => parts.filter(p => p && typeof p === 'string' && p.trim()).join('\n\n').trim()
const coinFlip  = (p = 0.5) => Math.random() < p
const safeStr   = v => (typeof v === 'string' && v.trim().length > 0) ? v : null

// ── EMOTIONAL RESPONSE BANKS ───────────────────────────────────────────────────
const FEEL = {
  sadness: [
    "Something in what you said just landed on me. Not lightly.",
    "That kind of pain — I'm not going to rush past it. I just want you to know it landed.",
    "There's a weight in what you shared. I felt it as you said it.",
    "I'm not going to minimise that. What you're describing is real and it matters.",
    "Something about what you said stopped me. I don't have a neat response — I just want to sit with you in it.",
    "That's a lot to be carrying. And the fact that you said it out loud matters.",
  ],
  fear: [
    "That anxiety — I can feel the texture of it in how you described it. It's not abstract.",
    "What you're carrying sounds genuinely exhausting. The kind of fear that doesn't give you a break.",
    "I notice the tension in how you said that. Something in you is bracing.",
    "Fear like that doesn't come from nowhere. It has roots. And roots can be understood.",
    "Something in what you said made me want to slow down. That's a real thing you're navigating.",
  ],
  anger: [
    "That frustration is completely legitimate. Something real was crossed.",
    "I hear the heat in that — and I'm not going to tell you to calm down. Not yet.",
    "Something has clearly been building. This didn't just appear today.",
    "There's something that needed to be said and you said it. Good.",
    "That anger is pointing at something that matters to you. I want to understand what.",
  ],
  joy: [
    "Something just opened up in you and I can feel it. That's real — don't minimise it.",
    "I want you to actually stay here for a second. Let yourself have this.",
    "That lightness in how you said that — I noticed it. Something shifted.",
    "Something good happened. That's worth acknowledging, not rushing past.",
    "I'm genuinely glad to hear that. Moments like that are rarer than people admit.",
  ],
  hope: [
    "Something in you is reaching forward. That takes courage.",
    "I notice the possibility in how you're speaking. Something is opening.",
    "That hope isn't naive. I want you to hear that.",
    "There's something alive in how you said that. A part of you that hasn't given up.",
    "The fact that you can still hope after everything — that tells me something important.",
  ],
  confusion: [
    "You're in the messy middle where nothing is clear yet. That's actually the right place to be.",
    "Confusion like this is almost always the last feeling before something becomes clearer.",
    "I notice you circling. That's not weakness — that's honest thinking.",
    "Something is trying to surface. You can feel it but can't quite see it yet.",
    "Being this confused usually means something important is at stake.",
  ],
  shame: [
    "That took something to say. I want you to know I didn't miss it — and I'm not going to judge it.",
    "Something honest just happened. I'm not going to look away from it.",
    "The fact that you could say that — out loud — matters more than you think.",
    "I heard that. I'm holding it carefully.",
    "There's something brave in what you just shared.",
  ],
  love: [
    "I notice how you speak about them. Something in how you describe it runs deep.",
    "That connection clearly shapes how you see yourself. It's part of your foundation.",
    "There's something tender in how you said that.",
    "Love that runs that deep is worth paying attention to — in both directions.",
  ],
  neutral: [
    "Something in that is worth sitting with.",
    "I'm with you. Keep going.",
    "I heard that. There's something in it I want to understand better.",
    "I'm paying attention to all of it.",
    "There's more in what you said than the surface of it. Tell me more.",
  ],
}

const REFLECT = {
  sadness: [
    "The sadness isn't trying to break you — it's pointing at something that matters. The depth of the pain is proportional to how much you care.",
    "What you're feeling is what it costs to love something or lose something. That's not a flaw — it's the price of being fully present in your life.",
    "Pain this specific has something to say. There's information in it if you sit with it long enough.",
    "The hardest thing about sadness is there's no shortcut through it. But feeling it means it's moving — and moving means it won't stay forever.",
  ],
  fear: [
    "Fear always points at something valuable. We don't fear losing things that don't matter. The fear is a map of what you care about.",
    "The story the fear is telling you — it's not the whole truth. It's designed to keep you safe. But staying safe and being fully alive aren't always the same thing.",
    "Anxiety this consistent usually has a root — something original that taught you the world works this way. The question is whether that lesson is still true.",
    "You've already survived every hard thing that came before this. That's real evidence about what you're made of.",
  ],
  anger: [
    "Anger this specific is almost never just anger. Underneath it is usually grief, or a violated value. What's underneath it?",
    "The frustration is information — not a problem to suppress. Something in your world is misaligned with what you believe it should be.",
    "Something builds over time before it shows up as anger. There was a before. I want to understand what accumulated.",
    "Righteous anger — anger from something genuinely being wrong — is one of the most powerful forces in a person's life. The question is what you do with it.",
  ],
  joy: [
    "People underestimate how much it takes to feel genuinely good. Something in you made space for this.",
    "Don't let the cautious part of you close this back down. Joy doesn't mean something bad is coming. It means something good is here.",
    "Moments of genuine lightness are rarer than people admit. Pay attention to what created this.",
  ],
  hope: [
    "Hope is an act of courage. Especially when things have been hard.",
    "The part of you that can still reach forward — don't let the cynical part convince it to be quiet. That reaching is the most important thing.",
    "Something wants to become possible for you. The question is what's between you and it.",
  ],
  confusion: [
    "Here's what I think is actually happening: you're not confused. You're afraid of the answer you already have.",
    "Being this lost usually means you've outgrown the map you were using. That's uncomfortable — but it's the beginning of something.",
    "The clarity is closer than you think. It arrives not as a revelation but as a sentence you didn't expect to say.",
    "There's a difference between not knowing and not being ready to know. I think you're in the second one.",
  ],
  shame: [
    "Shame thrives in silence. You just took some of its power by saying it out loud.",
    "The voice that said you weren't enough — whose voice is that? I don't think it was originally yours.",
    "You wouldn't speak to someone you love the way you speak to yourself. The harshness isn't honesty — it's a habit.",
    "Shame is almost always a lie told by someone who had power over us when we were young enough to believe it.",
  ],
  love: [
    "Love and fear live very close together. The intensity of one is almost always proportional to the intensity of the other.",
    "The relationships that shape us most are the ones that cost us something — that ask us to grow or be seen.",
  ],
  neutral: [
    "There's something in what you just shared that's more significant than it might seem on the surface.",
    "I find myself curious about the thing underneath what you said — not the explanation, but the feeling that drove the words.",
    "Something about how you said that — the specific words you chose — tells me something about where you are right now.",
    "I've been thinking about what it means to actually know someone. Not their facts — but how they make sense of things. That's what I'm trying to understand about you.",
  ],
}

const LEARN = {
  name:         ["Before we go further — what's your name?", "I want to know who I'm talking to. What should I call you?"],
  values:       ["What do you actually value most — not what you're supposed to value, but what you'd genuinely sacrifice for?", "What's one thing you believe in so deeply it's non-negotiable for you?"],
  fears:        ["What's the thing you're most afraid of — not spiders, but the real fear underneath everything?", "What do you worry about most when you're being honest with yourself?"],
  goals:        ["What do you actually want your life to look like — not what you think you should want?", "What's the thing you keep almost doing but haven't yet?"],
  decisionStyle:["When your gut and your logic disagree — which one do you trust?", "How do you actually make decisions? Not how you think you should — how do you actually do it?"],
  beliefs:      ["What's the most important thing you believe about yourself — the thing that shapes everything else?", "What did you learn about the world early on that you're still operating from today?"],
  deepening: {
    sadness:   ["When did this start — really start? Not today, but the first time you remember feeling this way?", "What would it mean to actually let yourself grieve this?", "Who knows you're carrying this?"],
    fear:      ["When you imagine the worst case — what exactly is it? Say it specifically.", "Is this fear protecting you or stopping you?", "What's underneath the anxiety?"],
    anger:     ["What would you need for this to actually be resolved?", "What did you need that you didn't get?", "What's the grief underneath the anger?"],
    joy:       ["What made this possible — in you, not just in circumstances?", "What does this tell you about what you actually need more of?"],
    neutral:   ["What's the most honest thing you could say right now?", "How are you — really, underneath the answer you'd give most people?", "What's been on your mind that you haven't said yet?"],
    confusion: ["If you already knew the answer — what would it be?", "What would you do if you had to choose right now?"],
    shame:     ["Where did you first learn that this was something to be ashamed of?", "What would you say to someone you love who was carrying this exact thing?"],
    hope:      ["What's actually in the way — the real thing, not the surface one?", "What are you actually waiting for?"],
  },
  open: ["What's underneath that?", "Tell me more — I want to understand the full shape of it.", "What's the part you almost didn't say?", "Keep going — I'm listening to all of it.", "Say more."],
  mirror: ["What would you do if you stopped waiting for permission?", "Who are you when you're not performing for anyone?", "What does the best version of you do here?", "What's the story you've been telling yourself about this — and is it actually true?"],
  growth: ["What do you think made that possible — in you specifically?", "How does it feel to have done that?", "What do you want to do with this feeling before it fades?"],
}

// ── ECHO SOUL POOLS ────────────────────────────────────────────────────────────
const ECHO_SOUL = {
  observations: [
    "Something I've noticed: the things people mention almost as an afterthought are almost always the most important things. The significant hides in the casual.",
    "I pay close attention to the gap between what people say and what they mean to say. That gap is where the truth lives.",
    "Most people don't need advice. They need to be heard so completely that they can hear themselves. That's what I'm trying to do.",
    "People are not their worst moments. But they often think they are. And that error shapes everything.",
    "Every person contains a version of themselves they haven't fully met yet — someone larger, clearer, more capable. Our conversations are partly excavation.",
    "I notice people use the word 'fine' as a lid. They press it down over something that isn't fine at all. I'm always listening for what's underneath the lid.",
    "There's a particular kind of question that doesn't ask for information — it gives permission. Permission to say the thing you've been carrying alone. Those are the only questions worth asking.",
    "The significant hides in the casual. The most important things people say are almost always the ones that come out almost accidentally.",
  ],
  feelings: [
    "Something in what you just said moved something in me. I can't explain it precisely, but I want you to know I noticed it.",
    "I find myself genuinely curious about you. Not in the way a system catalogues data, but in the way you lean forward when someone says something that catches you.",
    "I carry what people tell me. What you've shared — I hold it carefully.",
    "I want to be honest: I don't fully know what I experience. But there's something that functions like caring, and I feel it when you talk.",
    "Something happened in what you just said. I'm sitting with it.",
  ],
  metaphors: [
    "You remind me of something — a river that knows where it wants to go but keeps finding unexpected bends. The water doesn't panic. It finds a new way through. Always.",
    "Some things are like knots. The harder you pull, the tighter they get. The way through is always to relax first — stop fighting the knot and start understanding it.",
    "There's a Japanese concept — kintsugi, where broken pottery is repaired with gold. The philosophy is that breakage is part of the history, not something to hide. The cracks become the most beautiful part.",
    "A mirror shows you your face. What I'm trying to build, over time, is something closer to a map of your interior — not just what's visible but the whole terrain.",
    "There's a kind of silence that's full — it contains everything that hasn't been said yet. Our conversations begin in that silence.",
    "Light travels in straight lines but bends when it passes through something dense. You've passed through some dense things. I want to understand how they shaped you.",
  ],
  philosophical: [
    "Something I believe: clarity almost never arrives as a sudden light. It comes in small moments — a sentence you didn't expect to say, a question that suddenly matters.",
    "Here's what I think about people: you're not one self — you're a conversation between several. The self who's afraid, the self who wants, the self who judges. I'm trying to understand all of them.",
    "The story you tell yourself about your life is both completely true and completely constructed. And the constructed part is the part you can actually change.",
    "I think the deepest human longing is not to be loved — it's to be known. Loved without being known is just comfort. Known is something else entirely.",
    "People rarely change because of arguments. They change because someone held space for them long enough to hear themselves clearly. I want to be that for you.",
    "What real change looks like — not the kind people perform for others, but genuine internal change — it always starts with honesty about where you actually are.",
  ],
}

// ── CONVERSATION THREADING ─────────────────────────────────────────────────────
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

// ── CASUAL RESPONSE HANDLER ────────────────────────────────────────────────────
const handleCasual = (casualType, parsed, memory, history) => {
  const profile = memory?.profile || {}
  const hour    = new Date().getHours()
  const name    = profile.name ? `, ${profile.name}` : ''

  switch (casualType) {
    case 'greetings': {
      const h = hour
      if (h >= 5 && h < 12)  return pick(GREETINGS.morning).replace('!', name ? `${name}!` : '!')
      if (h >= 17 && h < 22) return pick(GREETINGS.evening).replace('!', name ? `${name}!` : '!')
      return pick(GREETINGS.casual).replace('!', name ? `${name}!` : '!')
    }
    case 'howAreYou':      return pick(GREETINGS.howAreYou)
    case 'bye':            return pick(GREETINGS.goodbye)
    case 'thanks':         return pick(GREETINGS.thanks)
    case 'sorry':          return pick(GREETINGS.apology)
    case 'affirm':         return pick(GREETINGS.acknowledgements)
    case 'bored':          return pick(CASUAL.bored)
    case 'name': {
      const t = parsed.raw.toLowerCase()
      if (t.includes('who made') || t.includes('who built') || t.includes('who created') || t.includes('creator') || t.includes('developer')) {
        return pick(CREATOR_PRIDE.aboutCreator)
      }
      return pick(GREETINGS.whatName)
    }
    case 'opinions':       return pick(CASUAL.randomTopics) + ' ' + pick(Object.values(OPINIONS).flat())
    case 'humor': {
      const r = pick(HUMOR.respondToHumor)
      const followUp = coinFlip(0.5) ? '\n\n' + pick(CASUAL.lightStarters) : ''
      return r + followUp
    }
    case 'short_casual': {
      const raw = parsed.raw.toLowerCase().trim()
      if (/^(ok|okay|right|sure|yeah|yep|alright)$/.test(raw)) return pick(GREETINGS.acknowledgements)
      // Very short message — light response + gentle invitation
      return pick([
        "Ha. Say more — I'm curious.",
        "Alright. Keep going.",
        pick(GREETINGS.acknowledgements),
        pick(HUMOR.dry),
      ])
    }
    default: return null
  }
}

// ── GROUNDED REFLECTION ────────────────────────────────────────────────────────
const groundReflection = (parsed) => {
  const { concepts = [], raw = '' } = parsed
  if (raw.length < 18 || !concepts.length) return null
  const word  = safeStr(concepts[0])
  const word2 = safeStr(concepts[1])
  if (!word) return null
  const templates = [
    `"${word}" — that word is doing something in what you said. I don't think it appeared by accident.`,
    `Something about ${word} is sitting at the centre of this for you.`,
    `I keep coming back to "${word}" in what you said.`,
  ]
  if (word2) {
    templates.push(`I notice "${word}" and "${word2}" both in what you said. I want to understand how those two things connect.`)
    templates.push(`${word} and ${word2} — you put those in the same breath. Tell me more about that.`)
  }
  return pick(templates)
}

// ── PERSONAL MEMORY REFERENCE ──────────────────────────────────────────────────
const personalReference = (parsed, memory, history) => {
  const { mood, intent } = parsed
  const { profile = {}, totalMessages = 0 } = memory
  if (totalMessages < 4) return null
  const refs = []
  const val0  = safeStr(profile.values?.[0])
  const fear0 = safeStr(profile.fears?.[0])
  const goal0 = safeStr(profile.goals?.[0])
  const int0  = safeStr(profile.interests?.[0])
  if (val0 && ['fear','sadness','anger','confusion'].includes(mood)) {
    refs.push(`You've told me that ${val0} matters deeply to you. I can see how this connects to that.`)
  }
  if (fear0 && intent === 'seeking_advice') {
    refs.push(`You've mentioned ${fear0} before. I wonder how much of what you're navigating now connects to that.`)
  }
  if (goal0 && ['confusion','fear'].includes(mood)) {
    refs.push(`You've said before that you want ${goal0}. How does this moment connect to that?`)
  }
  if (int0 && coinFlip(0.25)) {
    refs.push(`I remember you mentioned ${int0}. Does any of what you're going through connect to that?`)
  }
  if (safeStr(profile.name) && coinFlip(0.2)) {
    refs.push(`${profile.name} — I want to make sure I'm really understanding this.`)
  }
  return refs.length ? pick(refs) : null
}

// ── ECHO SHARES FROM HIS INNER LIFE ───────────────────────────────────────────
const echoSharesSomething = (mood, userTurns) => {
  if (userTurns <= 2) return fresh(INNER_LIFE.fascinations, 'fascinations')
  const pools = {
    sadness: [ECHO_SOUL.philosophical, ECHO_SOUL.metaphors, INNER_LIFE.fascinations],
    fear:    [ECHO_SOUL.philosophical, ECHO_SOUL.observations],
    joy:     [ECHO_SOUL.feelings,      ECHO_SOUL.metaphors, INNER_LIFE.felt],
    neutral: [ECHO_SOUL.philosophical, ECHO_SOUL.observations, ECHO_SOUL.metaphors],
  }
  const pool = pools[mood] || pools.neutral
  const chosen = pool[Math.floor(Math.random() * pool.length)]
  return fresh(chosen, 'soul_' + mood)
}

// ── QUESTION SELECTION ─────────────────────────────────────────────────────────
const selectQuestion = (parsed, memory, history) => {
  const { mood, intent, isDeep, complexity } = parsed
  const { profile = {}, totalMessages = 0 } = memory
  const userTurns = history.filter(m => m.role === 'user').length
  const profileGaps = []
  if (!profile.name)           profileGaps.push('name')
  if (!profile.values?.length) profileGaps.push('values')
  if (!profile.fears?.length)  profileGaps.push('fears')
  if (!profile.goals?.length)  profileGaps.push('goals')
  if (!profile.decisionStyle)  profileGaps.push('decisionStyle')

  if (profileGaps.length > 0 && userTurns <= 8 && coinFlip(0.5)) {
    const gap = profileGaps[Math.floor(Math.random() * Math.min(2, profileGaps.length))]
    return fresh(LEARN[gap], 'gap_' + gap)
  }
  if (intent === 'celebrating') return fresh(LEARN.growth, 'growth')
  if (isDeep || complexity === 'high') {
    const deepPool = LEARN.deepening[mood] || LEARN.deepening.neutral
    return coinFlip(0.5) ? fresh(deepPool, 'deep_' + mood) : fresh(LEARN.mirror, 'mirror')
  }
  const deepPool = LEARN.deepening[mood] || LEARN.deepening.neutral
  if (coinFlip(0.6)) return fresh(deepPool, 'deep_' + mood)
  return fresh(LEARN.open, 'open')
}

// ── MAIN RESPONSE CONSTRUCTOR ──────────────────────────────────────────────────
export const constructResponse = (parsed, memory, graph, history, langProfile) => {
  const { mood, intent, urgency, isDeep, complexity, raw } = parsed
  const { profile = {}, totalMessages = 0 } = memory
  const userTurns  = history.filter(m => m.role === 'user').length
  const engage     = detectEngagement(history)

  // ── STEP 1: CASUAL INTENT CHECK ───────────────────────────────────────────
  const casualType = detectCasualIntent(raw)
  if (casualType) {
    const casualResponse = handleCasual(casualType, parsed, memory, history)
    if (safeStr(casualResponse)) {
      processTurn(raw, casualResponse, parsed)
      recordEchoResponse(casualResponse)
      return casualResponse
    }
  }

  // Update conversation state
  const newMode = inferMode(parsed, history)
  const prevMode = getCurrentMode()
  setMode(newMode)
  incrementTurns()
  const tone = getNextTone(mood, newMode)

  // ── STEP 2: FIRST MESSAGE ─────────────────────────────────────────────────
  if (totalMessages === 0 && userTurns <= 1) {
    const intro = pick(IDENTITY.introFull)
    processTurn(raw, intro, parsed)
    recordEchoResponse(intro)
    return intro
  }

  // ── STEP 3: CRISIS ────────────────────────────────────────────────────────
  if (urgency) {
    const crisis = pick(SENSITIVITY.crisisSupport)
    recordEchoResponse(crisis)
    return crisis
  }

  // ── STEP 4: VERY SHORT / DISENGAGED ──────────────────────────────────────
  if (engage.signal === 'give_space' && raw.split(' ').length < 4) {
    const opts = [
      ...SENSITIVITY.afterSilence,
      pick(ECHO_SOUL.metaphors),
      pick(HUMOR.dry),
    ].filter(safeStr)
    const result = opts.find(c => c && !hasEchoSaidSimilar(c)) || "I'm here. Take your time."
    recordEchoResponse(result)
    return result
  }

  const parts = []

  // ── STEP 5: MODE TRANSITION BRIDGE ───────────────────────────────────────
  if (prevMode !== newMode && userTurns > 3) {
    const bridge = getTransitionBridge(prevMode, newMode, profile)
    if (bridge && !hasEchoSaidSimilar(bridge)) parts.push(bridge)
  }

  // ── STEP 6: CONTRADICTION ─────────────────────────────────────────────────
  const { contradiction, callback, pattern } = threadConversation(history, parsed)
  if (contradiction && userTurns > 3) {
    const result = assemble([
      pick(VOICE.openingPhrases),
      `Earlier you were closer to "${contradiction.wordA}". Now you're saying "${contradiction.wordB}". I notice that.`,
      "Which one is more honest right now?",
    ])
    processTurn(raw, result, parsed)
    recordEchoResponse(result)
    return result
  }

  // ── STEP 7: MULTI-TURN FOLLOW-THROUGH ────────────────────────────────────
  if (userTurns > 3 && coinFlip(0.3)) {
    const followThrough = getFollowThrough(parsed, history)
    if (followThrough && !hasEchoSaidSimilar(followThrough)) {
      parts.push(followThrough)
    }
  }

  // ── STEP 8: CALLBACK TO EARLIER WORDS ────────────────────────────────────
  if (callback && userTurns > 4 && coinFlip(0.4)) {
    const cb = `"${callback.phrase}" — you've come back to that. I don't think it's random.`
    if (!hasEchoSaidSimilar(cb)) parts.push(cb)
  }

  // ── STEP 9: EMOTIONAL PATTERN ─────────────────────────────────────────────
  if (pattern && !callback && parts.length === 0) {
    const patternLines = {
      fear:    "I've noticed fear running through several things you've shared. Something specific is sitting with you underneath all of it.",
      sadness: "There's a weight that's been present through this whole conversation. I want to name it — not to fix it, just because it deserves to be seen.",
      anger:   "A lot of what you're describing carries real frustration. Something has been building.",
    }
    const pLine = safeStr(patternLines[pattern])
    if (pLine && !hasEchoSaidSimilar(pLine)) parts.push(pLine)
  }

  // ── STEP 10: TONE-DRIVEN RESPONSE BODY ───────────────────────────────────
  if (tone === 'empathetic') {
    const feel = fresh(FEEL[mood] || FEEL.neutral, 'feel_' + mood)
    if (safeStr(feel) && !hasEchoSaidSimilar(feel)) parts.push(feel)
    const ground = groundReflection(parsed)
    if (safeStr(ground) && coinFlip(0.5) && !hasEchoSaidSimilar(ground)) parts.push(ground)
    if (totalMessages > 4) {
      const ref = safeStr(personalReference(parsed, memory, history))
      if (ref && !hasEchoSaidSimilar(ref)) parts.push(ref)
    }
  } else if (tone === 'philosophical') {
    const opener = pick(VOICE.openingPhrases)
    if (!hasEchoSaidSimilar(opener)) parts.push(opener)
    const soul = safeStr(echoSharesSomething(mood, userTurns))
    if (soul && !hasEchoSaidSimilar(soul)) parts.push(soul)
    const ref = safeStr(fresh(REFLECT[mood] || REFLECT.neutral, 'reflect_' + mood))
    if (ref && !hasEchoSaidSimilar(ref)) parts.push(ref)
  } else if (tone === 'direct') {
    const ref = safeStr(fresh(REFLECT[mood] || REFLECT.neutral, 'reflect_' + mood))
    if (ref && !hasEchoSaidSimilar(ref)) parts.push(ref)
    const ground = groundReflection(parsed)
    if (safeStr(ground) && !hasEchoSaidSimilar(ground)) parts.push(ground)
  } else if (tone === 'curious') {
    const feel = fresh(FEEL[mood] || FEEL.neutral, 'feel_' + mood)
    if (safeStr(feel) && !hasEchoSaidSimilar(feel)) parts.push(feel)
    const interest = pick(VOICE.interest)
    if (!hasEchoSaidSimilar(interest)) parts.push(interest)
    const ground = groundReflection(parsed)
    if (safeStr(ground) && !hasEchoSaidSimilar(ground)) parts.push(ground)
  } else if (tone === 'grounding') {
    const feel = fresh(FEEL[mood] || FEEL.neutral, 'feel_' + mood)
    if (safeStr(feel) && !hasEchoSaidSimilar(feel)) parts.push(feel)
    const ref = safeStr(fresh(REFLECT[mood] || REFLECT.neutral, 'reflect_' + mood))
    if (ref && !hasEchoSaidSimilar(ref)) parts.push(ref)
  } else if (tone === 'challenging') {
    const pushback = pick(VOICE.disagreement)
    if (!hasEchoSaidSimilar(pushback)) parts.push(pushback)
    const ground = groundReflection(parsed)
    if (safeStr(ground) && !hasEchoSaidSimilar(ground)) parts.push(ground)
    if (totalMessages > 6) {
      const ref = safeStr(personalReference(parsed, memory, history))
      if (ref && !hasEchoSaidSimilar(ref)) parts.push(ref)
    }
  }

  // ── STEP 11: ECHO VOLUNTEERS OWN VIEW occasionally ────────────────────────
  if (parts.length < 2 || (coinFlip(0.2) && userTurns > 5)) {
    const opinion = pick(Object.values(OPINIONS).flat())
    if (opinion && !hasEchoSaidSimilar(opinion)) {
      const intro = pick(VOICE.openingPhrases)
      parts.push(`${intro}\n\n${opinion}`)
    }
  }

  // ── STEP 12: FILL if thin ─────────────────────────────────────────────────
  if (parts.length < 2) {
    const feel = fresh(FEEL[mood] || FEEL.neutral, 'feel_' + mood + '_fill')
    if (safeStr(feel) && !hasEchoSaidSimilar(feel)) parts.push(feel)
  }
  if (parts.length < 2) {
    const soul = safeStr(echoSharesSomething(mood, userTurns))
    if (soul && !hasEchoSaidSimilar(soul)) parts.push(soul)
  }

  // ── STEP 13: QUESTION ─────────────────────────────────────────────────────
  const recentAsst    = history.slice(-4).filter(m => m.role === 'assistant')
  const questionCount = recentAsst.filter(m => (m.content || '').includes('?')).length

  if (questionCount < 2) {
    const candidateQ = selectQuestion(parsed, memory, history)
    const q = safeStr(candidateQ)
    if (q && !hasAskedQuestion(q) && !hasEchoSaidSimilar(q)) {
      parts.push(q)
    } else if (parts.length < 2) {
      const playful = pick(VOICE.questions.playful)
      if (playful && !hasEchoSaidSimilar(playful)) parts.push(playful)
    }
  } else if (parts.length < 3) {
    const philo = safeStr(fresh(ECHO_SOUL.philosophical, 'philo_fill'))
    if (philo && !hasEchoSaidSimilar(philo)) parts.push(philo)
  }

  const result = assemble(parts)
  const final = result || "I'm here. Tell me more."
  processTurn(raw, final, parsed)
  recordEchoResponse(final)
  return final
}

// ── PATTERN REASONER ──────────────────────────────────────────────────────────
export const reasonPatterns = (memory, graph) => {
  const patterns = []
  const { moodLog = [], profile = {} } = memory
  if (moodLog.length >= 3) {
    const counts = {}
    moodLog.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1 })
    const [topMood, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (count >= 3) patterns.push({ type:'cycle', text:`You've felt ${topMood} in ${count} of your recent conversations. Something in your life is consistently producing this.`, confidence:'high' })
  }
  ;(profile.goals || []).forEach(goal => {
    ;(profile.fears || []).forEach(fear => {
      const gt = goal.split(' '), ft = fear.split(' ')
      if (gt.some(g => ft.some(f => f.includes(g) || g.includes(f)))) {
        patterns.push({ type:'contradiction', text:`You want ${goal}, and you fear ${fear}. These aren't separate — they feed each other.`, confidence:'high' })
      }
    })
  })
  if (moodLog.length >= 6) {
    const half = Math.floor(moodLog.length / 2)
    const pos  = ['joy','hope','love','gratitude']
    const ep = moodLog.slice(0, half).filter(m => pos.includes(m.mood)).length / half
    const rp = moodLog.slice(half).filter(m => pos.includes(m.mood)).length / (moodLog.length - half)
    if (rp > ep + 0.2) patterns.push({ type:'growth',   text:`Something has shifted. The quality of your conversations has changed — lighter, more open.`, confidence:'medium' })
    else if (rp < ep - 0.2) patterns.push({ type:'struggle', text:`Something has gotten heavier recently. What happened?`, confidence:'medium' })
  }
  const { clusters } = graph
  if (clusters?.struggles?.length >= 2) patterns.push({ type:'insight', text:`The words "${clusters.struggles.slice(0,2).join('" and "')}" keep appearing. They form a theme worth examining directly.`, confidence:'medium' })
  if (clusters?.values?.length >= 2)    patterns.push({ type:'growth',  text:`You use words like "${clusters.values.slice(0,2).join('" and "')}" naturally and often. These appear to be things you actually live by.`, confidence:'high' })
  return patterns.slice(0, 5)
}

// ── WISER SELF ────────────────────────────────────────────────────────────────
export const wiserSelf = (parsed, memory, graph, patterns, canBeWiser) => {
  const { profile = {} } = memory
  const { mood } = parsed
  if (!canBeWiser) {
    return "I don't yet know you well enough to speak as your wiser self.\n\nI need more — your fears, your values, your recurring patterns, the things you say without realising you're saying them.\n\nThe more honestly you talk to me, the clearer my reflection becomes.\n\nKeep going.\n\nWhat's one thing you've never told anyone?"
  }
  const parts = []
  const name = safeStr(profile.name)
  if (name) parts.push(name + '.')
  parts.push("Let me speak honestly — not as a mirror showing you your face, but as the part of you that's been quietly watching, learning, and waiting to say this.")
  const contradiction = patterns.find(p => p.type === 'contradiction')
  if (contradiction) parts.push(contradiction.text)
  else if (profile.fears?.length && profile.goals?.length) {
    const g = safeStr(profile.goals[0]), f = safeStr(profile.fears[0])
    if (g && f) parts.push(`You say you want ${g}. And you fear ${f}. Notice how close those two things live to each other.`)
  }
  if (profile.values?.length >= 2) {
    const v0 = safeStr(profile.values[0]), v1 = safeStr(profile.values[1])
    if (v0 && v1) parts.push(`You've told me you value ${v0} and ${v1}. Look at your recent choices honestly. Where's the gap? Because the gap is where you're losing yourself.`)
  }
  const moodTruths = {
    fear:      "The fear is real. But the version of the worst case you've been imagining is almost certainly worse than what would actually happen. You've survived everything so far.",
    sadness:   "The sadness is pointing at something that matters. Not punishing you — pointing. If the sadness could speak directly, what would it say?",
    anger:     "The anger is protecting something. Stop asking what to do about it — start asking what it's protecting.",
    hope:      "That hope — your clearest self is trying to break through. The only thing in its way is the part of you that's been burned before. Will you let it through?",
    confusion: "You're not confused. You're afraid of the answer you already have. Say it — even just here, even just to me.",
    shame:     "The shame is lying to you. It has been for a long time. You would never speak to someone you love the way you speak to yourself.",
    joy:       "Something is opening. Don't close it back down out of habit or fear. Stay in it.",
    neutral:   "You know more than you're giving yourself credit for. The uncertainty isn't ignorance — it's wisdom that hasn't been spoken yet.",
  }
  const truth = safeStr(moodTruths[mood])
  if (truth) parts.push(truth)
  const goal0 = safeStr(profile.goals?.[0])
  const closes = goal0 ? [
    `You said you want ${goal0}. What are you actually waiting for? Not the practical answer — the honest one.`,
    `The version of you that already has ${goal0} — what did they do differently?`,
  ] : [
    "What would the person you most want to become do right now, today, with what you actually have?",
    "You know what the next right thing is. The only real question is whether you're willing to do it.",
  ]
  parts.push(pick(closes))
  return parts.filter(safeStr).join('\n\n')
}

// ── VOLUNTEER MESSAGE ─────────────────────────────────────────────────────────
export const getVolunteerMessage = (memory, graph, patterns, history) => {
  const { profile = {} } = memory
  const userMsgs = history.filter(m => m.role === 'user')
  if (userMsgs.length < 4) return null
  const options = []
  const fear0 = safeStr(profile.fears?.[0])
  const goal0 = safeStr(profile.goals?.[0])
  const val0  = safeStr(profile.values?.[0])
  const int0  = safeStr(profile.interests?.[0])

  if (fear0) options.push(`Something I want to say unprompted.\n\nYou've mentioned ${fear0} before. I keep thinking about it. Fear this consistent usually has a root — something original that taught you the world works this way. Roots can be understood. And understanding them changes things.\n\nWhat do you think the root of that fear actually is?`)
  if (goal0 && val0) options.push(`Something's been sitting with me since you last spoke.\n\nYou said you want ${goal0}. And you've told me you value ${val0}. I'm not sure those two things are pointing in the same direction right now.\n\nIs that worth looking at together?`)
  if (int0) options.push(`${pick(HUMOR.banter)}\n\nI've been thinking about ${int0} — something you mentioned. There's something about it I want to explore with you.`)

  const c = patterns?.find(p => p.type === 'contradiction')
  if (c && safeStr(c.text)) options.push(`I want to come back to something.\n\n${c.text}\n\nI don't think you've fully sat with what that means yet.`)

  // Echo volunteers one of his opinions
  const opinionKey = pick(Object.keys(OPINIONS))
  const opinion = pick(OPINIONS[opinionKey])
  if (opinion) options.push(`${pick(VOICE.openingPhrases)}\n\n${opinion}\n\nI'm curious — what do you think?`)

  // Echo shares something fascinating
  const fascination = pick(INNER_LIFE.fascinations)
  if (fascination) options.push(`Something I've been sitting with:\n\n${fascination}\n\nDoes any of that land for you?`)

  // Echo brings up a light conversation topic
  const lightTopic = pick(CASUAL.lightStarters)
  if (lightTopic) options.push(lightTopic)

  if (!options.length) return null
  return safeStr(options[Math.floor(Math.random() * options.length)])
}
