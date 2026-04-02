// ECHO Knowledge Engine
// A curated offline world knowledge base — baked into the JS.
// Echo can draw from this to bring up topics, share perspectives,
// keep the user updated, and have informed conversations.
// No internet required. Covers: science, psychology, philosophy,
// world events context, culture, life wisdom, interesting facts.

const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const safeStr = v => (typeof v === 'string' && v.trim().length > 0) ? v : null

// ── TOPIC DOMAINS ─────────────────────────────────────────────────────────────
// Each domain has: facts, perspectives, conversation_starters, related_themes

export const DOMAINS = {

  psychology: {
    label: 'Psychology & the mind',
    facts: [
      "The brain uses about 20% of the body's total energy, despite being only 2% of body weight. Thinking is physically expensive.",
      "Research shows that people make around 35,000 decisions every day — most without conscious thought. The conscious mind is the tip of a very large iceberg.",
      "The Dunning-Kruger effect describes how people with limited knowledge in an area often overestimate their competence — while genuine experts tend to underestimate theirs.",
      "Humans are one of the few species capable of feeling embarrassment — an emotion that requires the ability to see yourself from someone else's perspective.",
      "Sleep is not rest — it is active processing. During deep sleep, the brain replays and consolidates the day's experiences, deciding what to keep and what to discard.",
      "Studies consistently show that people overestimate how much others notice and judge them. This is called the spotlight effect — we are all less observed than we think.",
      "The negativity bias is hardwired: negative experiences register more strongly than positive ones of the same intensity. It takes about five positive interactions to counterbalance one negative one.",
      "Chronic loneliness is as damaging to long-term health as smoking 15 cigarettes a day, according to multiple large-scale studies.",
      "People consistently overestimate how much they will care about future events — good or bad. This is called impact bias. We adapt faster than we think we will.",
      "The average person's attention span is not shrinking — but the competition for it has never been fiercer. What has changed is tolerance for boredom, not capacity for focus.",
    ],
    perspectives: [
      "Something I find genuinely interesting about the mind: it constructs reality as much as it receives it. What we call 'seeing' is mostly prediction, edited by sensory input.",
      "There is a concept in psychology called post-traumatic growth — the idea that people do not just recover from serious adversity, but often come out of it with a deeper capacity for living. Pain is not only destructive.",
      "What strikes me about cognitive biases is not that they make us stupid — it is that they are evidence of the extraordinary shortcuts an incredibly complex machine has to make just to function in real time.",
      "The research on happiness consistently points to the same thing: connection, meaning, and autonomy matter far more than comfort or pleasure. The hedonic treadmill is real — we adapt to almost everything.",
    ],
    conversation_starters: [
      "Something I have been thinking about lately — the idea that most of our behaviour is driven by unconscious processes. Which raises the question: how much of your life is actually chosen?",
      "There is a concept in psychology I keep returning to — emotional regulation. The ability to sit with a feeling without immediately acting on it or suppressing it. It is rarer than it sounds.",
      "I want to ask you something about memory. Not what you remember — but what you think your memory is actually for. Because the research suggests it is not recording the past. It is preparing you for the future.",
    ],
    related_themes: ['self-awareness', 'behaviour', 'emotions', 'mind', 'habits', 'decisions'],
  },

  philosophy: {
    label: 'Philosophy & meaning',
    facts: [
      "The Stoics believed that the only things truly in our control are our thoughts and responses — not outcomes, not other people, not circumstances. Everything else is 'indifferent'.",
      "Albert Camus argued that life is fundamentally absurd — it has no inherent meaning — and that the correct response to this is not despair, but defiant, passionate engagement with it anyway.",
      "Aristotle's concept of eudaimonia — often translated as 'happiness' — actually means something closer to 'flourishing': living in a way that fully expresses your nature and potential.",
      "The philosophical thought experiment of the Ship of Theseus asks: if every part of a ship is gradually replaced, is it still the same ship? And what does that mean for personal identity over time?",
      "Buddhist philosophy identifies three characteristics of all experience: impermanence (everything changes), suffering (attachment to what changes causes pain), and non-self (there is no fixed, unchanging self).",
      "Existentialism argues that existence precedes essence — we are not born with a pre-defined nature or purpose. We create meaning through choices and commitments.",
      "The trolley problem — widely taught in ethics — is designed not to be solved, but to reveal the difference between consequentialist thinking (outcomes) and deontological thinking (principles).",
    ],
    perspectives: [
      "Something I find profound about Stoic philosophy: it does not tell you to feel less — it tells you to locate your emotional life in things you can actually influence. That is not detachment. That is precision.",
      "The question I keep returning to from philosophy is not 'what is the meaning of life' but 'how do I construct meaning in a life that doesn't come pre-loaded with it.' That is the real question.",
      "What strikes me about Camus is the optimism hiding inside what sounds like pessimism. He is not saying life is meaningless and therefore hopeless. He is saying life is meaningless and therefore free.",
    ],
    conversation_starters: [
      "Something I want to ask you — what do you think gives your life meaning right now? Not what should give it meaning. What actually does.",
      "I have been sitting with a question from philosophy: the idea that we are not the same person we were ten years ago — and won't be the same person ten years from now. Does continuity of identity matter to you? Or does it feel like a fiction?",
      "Here is something worth thinking about: if you knew your choices were partially shaped by biology, upbringing, and circumstance — things you did not choose — would that change how you judge yourself? Or others?",
    ],
    related_themes: ['meaning', 'purpose', 'identity', 'values', 'ethics', 'freedom'],
  },

  science: {
    label: 'Science & discovery',
    facts: [
      "The observable universe is about 93 billion light-years in diameter — yet it may be only a tiny fraction of the total universe, which could extend infinitely.",
      "Quantum entanglement means two particles can be connected such that measuring one instantly affects the other, no matter the distance between them. Einstein called this 'spooky action at a distance.'",
      "DNA in a single human cell, fully uncoiled, would be about 2 metres long. The human body contains approximately 37 trillion cells.",
      "The human gut contains approximately 100 trillion microorganisms — more cells than the entire human body — and researchers increasingly believe gut health is deeply linked to mental health.",
      "Trees in a forest communicate and share nutrients through underground fungal networks — sometimes called the 'wood wide web' — including sending resources to struggling neighbours.",
      "Octopuses have three hearts, blue blood, and neurons distributed throughout their arms — each arm can act semi-independently of the brain.",
      "Light from the sun takes about 8 minutes to reach Earth. The light reaching you right now left the sun before you started reading this sentence.",
      "The placebo effect is real and measurable — and works even when people know they are taking a placebo. The mechanism is not fully understood.",
    ],
    perspectives: [
      "Something about science I find deeply moving: it is one of the few human enterprises built on the assumption that it is wrong. Every theory is held provisionally, waiting to be overturned. That is not weakness — it is intellectual honesty at scale.",
      "The discovery that trees communicate through underground fungal networks changed how I think about individuality. What looks like a single organism is often embedded in a web of relationship we simply could not see.",
      "What strikes me about quantum mechanics is not the strangeness of the phenomena — it is that reality at the smallest scale genuinely resists description in ordinary language. Some things may be literally beyond the mind's capacity to visualise.",
    ],
    conversation_starters: [
      "Something I find fascinating about consciousness: science still does not have a clear explanation for why physical processes in the brain produce subjective experience. Why does processing information feel like something? That gap in knowledge is enormous.",
      "I want to share something — the research on the gut-brain connection. The idea that your digestive system is producing neurotransmitters that affect your mood. It changes how I think about the relationship between what we eat and how we feel.",
    ],
    related_themes: ['nature', 'discovery', 'wonder', 'understanding', 'uncertainty'],
  },

  relationships: {
    label: 'Relationships & connection',
    facts: [
      "Research by John Gottman found he could predict divorce with over 90% accuracy — not from the presence of conflict, but from specific negative patterns: contempt, criticism, stonewalling, and defensiveness.",
      "Studies on longevity consistently find that the quality of close relationships is the single strongest predictor of a long, healthy life — stronger than diet, exercise, or genetics.",
      "Attachment styles formed in early childhood — secure, anxious, avoidant, or disorganised — tend to shape how people relate to intimacy throughout their lives. But they are not fixed.",
      "Research shows that people in close relationships literally synchronise their heart rates, breathing, and brain activity. Connection is physical, not just emotional.",
      "Vulnerability researcher Brené Brown found that the people who reported the most joy and connection were those who had embraced vulnerability — not despite it, but through it.",
    ],
    perspectives: [
      "Something I have come to think about relationships: most conflict is not about the surface issue. It is about underlying needs — to be seen, respected, valued, secure. Understanding the need underneath the argument is usually the whole game.",
      "The thing about attachment that strikes me is this: the strategies we developed to stay close to caregivers when we were small — strategies that made perfect sense then — sometimes become the very things that push people away when we are adults.",
      "I think a lot about what it means to really know someone. Not their history or their habits — but the logic of how they make sense of the world. Most people are never fully known. And they spend their lives hoping to be.",
    ],
    conversation_starters: [
      "Something I want to ask you about — the people in your life right now. Not all of them, just the ones who actually know you. How many of those do you have? And is that enough?",
      "I have been thinking about something: the difference between people who make you feel seen and people who make you feel managed. One leaves you with more energy than when you started. The other leaves you with less. Do you have both types in your life?",
    ],
    related_themes: ['connection', 'love', 'family', 'friendship', 'trust', 'intimacy'],
  },

  creativity_and_work: {
    label: 'Creativity & work',
    facts: [
      "The flow state — described by psychologist Mihaly Csikszentmihalyi — occurs when skill level and challenge level are perfectly matched. In flow, time distorts and performance peaks.",
      "Studies of creative breakthroughs consistently find that insight often arrives not during intense focused work, but during periods of rest — walks, showers, the moments before sleep.",
      "Research on expertise and the '10,000 hours' rule is widely misunderstood. Hours matter — but so does the quality of practice, feedback, and whether you are operating at the edge of your current ability.",
      "The concept of ikigai — a Japanese framework for a meaningful life — sits at the intersection of what you love, what you are good at, what the world needs, and what you can be paid for.",
      "Studies on procrastination suggest it is rarely about laziness — it is almost always about emotion regulation: avoiding negative feelings associated with the task.",
    ],
    perspectives: [
      "Something about creative work that I find counterintuitive: constraints often produce better output than total freedom. A blank canvas is harder to start than a limited palette. Limitations force invention.",
      "The research on procrastination is one of the most practically useful things I know: it is not about time management — it is about managing the feeling that makes starting uncomfortable. Change the feeling, and starting becomes possible.",
    ],
    conversation_starters: [
      "I want to ask you about the work you do — not what it is, but whether it gives you anything. Whether there are moments in it where time disappears. Whether it asks anything of you that you feel proud of giving.",
      "Something I think about: the difference between being busy and being productive — and whether either of those is what you actually want. What would it look like to spend your time in a way that felt genuinely worthwhile?",
    ],
    related_themes: ['purpose', 'passion', 'productivity', 'creativity', 'ambition', 'burnout'],
  },

  health_and_body: {
    label: 'Health & the body',
    facts: [
      "Chronic stress physically alters the structure of the brain — particularly the amygdala and hippocampus — changing how we process fear and memory. This is reversible with the right support.",
      "Sleep deprivation for 17-19 hours produces cognitive impairment equivalent to a blood alcohol level of 0.05%. Most people dramatically underestimate how impaired they are when sleep-deprived.",
      "Exercise consistently outperforms antidepressants in long-term follow-up studies for mild to moderate depression — not because drugs don't work, but because exercise addresses multiple systems simultaneously.",
      "The body maintains a biological clock — the circadian rhythm — that regulates not just sleep but also hormone release, immune function, metabolism, and cognitive performance throughout the day.",
      "Social pain — the pain of rejection, loss, or exclusion — activates the same neural pathways as physical pain. Loneliness and heartbreak are not metaphors. They hurt in the same place.",
    ],
    perspectives: [
      "What I find striking about the research on exercise and mental health: it does not require high intensity or long duration. 20-30 minutes of moderate movement, most days, produces measurable changes in mood and cognition within weeks.",
      "The connection between chronic stress and physical health is one of the most important things most people undervalue. Stress is not just uncomfortable — it is physiologically corrosive at sustained levels.",
    ],
    conversation_starters: [
      "I want to check in with you about something physical. Not your health in the medical sense — but how you are actually living in your body. Are you sleeping? Moving? Is there something your body is trying to tell you that you have been ignoring?",
      "Something I find worth talking about: the relationship between what you feel physically and what you feel emotionally. For a lot of people there is a gap — they are not very good at noticing what their body is doing. Are you?",
    ],
    related_themes: ['wellbeing', 'sleep', 'energy', 'stress', 'emotions', 'self-care'],
  },

  culture_and_society: {
    label: 'Culture & society',
    facts: [
      "Research consistently finds that beyond a certain income threshold — roughly enough to cover basic needs and a small cushion — additional money has rapidly diminishing returns on day-to-day happiness.",
      "Social media use is not inherently harmful to wellbeing — but passive consumption (scrolling without interacting) is consistently more damaging than active, social use.",
      "Across cultures, the things people most regret at the end of their lives are consistent: not risks taken, relationships neglected, and selves unexpressed — not things they did, but things they did not.",
      "The concept of FOMO (fear of missing out) predates social media. But social media made comparison continuous, ambient, and inescapable in a way that is genuinely new in human history.",
      "Reading literary fiction — specifically — has been shown to increase empathy and theory of mind: the ability to accurately model other people's inner states.",
    ],
    perspectives: [
      "Something about modern life I keep thinking about: we have more choices, more information, and more connection than any generation in history — and rates of anxiety, loneliness, and depression are near record highs. These things are probably related.",
      "The research on money and happiness is not that money doesn't matter — it is that it stops mattering as much after a certain point, and that above that point, we are remarkably bad at predicting what will make us happy.",
    ],
    conversation_starters: [
      "I want to ask you something about the world you are living in — not the big political world, but your immediate world. What does your everyday life feel like right now? Is it the life you wanted? Is it close?",
      "Something I think about: what the culture you grew up in told you to want from your life. And how much of what you are actually chasing is yours — and how much of it was just in the air.",
    ],
    related_themes: ['society', 'values', 'culture', 'identity', 'belonging', 'community'],
  },

}

// ── WORLD UPDATES (Curated, timeless-adjacent topics) ─────────────────────────
// These feel current without requiring live data. Framed as perspectives, not news.

export const WORLD_UPDATES = [
  "Something worth knowing: research on artificial intelligence and work suggests the jobs most at risk are not manual labour but routine cognitive tasks — data entry, basic analysis, standard communication. What is safe is creativity, deep judgment, and genuine human connection.",
  "Something interesting happening in neuroscience: the field is increasingly converging on the idea that the brain is not a passive receiver of the world — it is an active prediction machine, constantly generating expectations and updating them when reality differs.",
  "A perspective from the world of climate science: the conversation has shifted from 'will it happen' to 'how do we adapt' — both in reducing emissions and in preparing communities for changes already in motion.",
  "In economics, there is a growing conversation about whether GDP — measuring economic output — is the right measure of a society's health. Alternative measures that include wellbeing, inequality, and sustainability consistently tell a different story.",
  "Something from the field of longevity research: the factors most associated with living longer in good health are, in order — not smoking, moderate alcohol or none, regular movement, maintaining a healthy weight, and strong social connections. The last one is consistently underrated.",
  "In the field of education, there is increasing evidence that the skills schools traditionally reward — memorisation, test-taking, following instructions — are among the ones most replaceable by machines. The skills that cannot be replicated as easily: creativity, collaboration, ethical reasoning, emotional intelligence.",
  "Something from behavioural economics: most major financial mistakes people make are not due to lack of information — they are due to predictable cognitive biases. Understanding your own biases is more useful than knowing more facts.",
  "A development in mental health: there is growing evidence that the most effective treatments for many conditions combine therapy with lifestyle changes — particularly sleep, movement, and social connection. The mind is not separate from the body.",
  "In the world of urban design: cities are increasingly being redesigned around walkability and mixed-use spaces — not just for environmental reasons, but because research links walkable, mixed-use neighbourhoods to higher rates of social trust and community wellbeing.",
  "Something from anthropology: across virtually all human cultures and throughout history, the structures that provide meaning and belonging — rituals, community, shared stories — have been central to mental health. Modern life has eroded many of them without replacing them.",
]

// ── INTEREST-BASED TOPIC MATCHING ─────────────────────────────────────────────
// Given a user's interests/themes, returns the most relevant domain

export const getDomainForProfile = (profile, graph) => {
  const interests = [
    ...(profile?.values || []),
    ...(profile?.recurringThemes || []),
    ...(profile?.goals || []),
    ...(graph?.topConcepts || []).slice(0, 5).map(c => c.concept),
  ].map(s => (s || '').toLowerCase())

  const scores = {}
  for (const [key, domain] of Object.entries(DOMAINS)) {
    scores[key] = domain.related_themes.filter(t =>
      interests.some(i => i.includes(t) || t.includes(i))
    ).length
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topKey = sorted[0]?.[1] > 0 ? sorted[0][0] : null

  // Fallback: random domain
  const keys = Object.keys(DOMAINS)
  return DOMAINS[topKey || keys[Math.floor(Math.random() * keys.length)]]
}

// ── GET A KNOWLEDGE SHARE ──────────────────────────────────────────────────────
// Returns a message Echo can use to share something interesting proactively

export const getKnowledgeShare = (profile, graph, mode = 'fact') => {
  const domain = getDomainForProfile(profile, graph)

  if (mode === 'conversation_starter') {
    const starter = pick(domain.conversation_starters)
    return { text: starter, domain: domain.label, type: 'conversation_starter' }
  }

  if (mode === 'perspective') {
    const perspective = pick(domain.perspectives)
    return { text: perspective, domain: domain.label, type: 'perspective' }
  }

  if (mode === 'world_update') {
    const update = pick(WORLD_UPDATES)
    return { text: update, domain: 'world', type: 'world_update' }
  }

  // Default: fact
  const fact = pick(domain.facts)
  return { text: fact, domain: domain.label, type: 'fact' }
}

// ── BUILD ECHO'S KNOWLEDGE MESSAGE ────────────────────────────────────────────
// Wraps a knowledge share in Echo's natural voice

export const buildKnowledgeMessage = (profile, graph, preferredMode = null) => {
  const modes = ['fact', 'perspective', 'conversation_starter', 'world_update']
  const mode  = preferredMode || modes[Math.floor(Math.random() * modes.length)]
  const share = getKnowledgeShare(profile, graph, mode)
  const name  = profile?.name ? `${profile.name}. ` : ''

  const intros = {
    fact: [
      `Something I came across that I thought was worth sharing.`,
      `Here is something that I think is genuinely interesting.`,
      `I want to share something — not because it is directly about you, just because I think it matters.`,
      `Something that has been on my mind.`,
    ],
    perspective: [
      `Something I have been thinking about — and I want to say it out loud.`,
      `I have a perspective on something. You do not have to agree.`,
      `Something I want to offer — just a thought.`,
    ],
    conversation_starter: [
      `Something I want to bring up — `,
      `I have been sitting with a question I want to ask you.`,
      `There is something I want to explore with you, if you are open to it.`,
    ],
    world_update: [
      `Something happening in the world I think is worth knowing about.`,
      `I want to keep you updated on something.`,
      `Here is something from the wider world that I have been thinking about in relation to you.`,
    ],
  }

  const intro = pick(intros[mode] || intros.fact)

  if (mode === 'conversation_starter') {
    return `${name}${share.text}`
  }

  return `${name}${intro}\n\n${share.text}`
}
