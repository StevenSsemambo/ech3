// ECHO Debater — ECHO picks a position and genuinely argues it against you
// Uses stored beliefs to construct real debates, not generic ones

const DEBATE_POSITIONS = [
  {
    id: 'comfort_zone',
    trigger: (profile) => profile.fears?.some(f => f.includes('fail') || f.includes('change') || f.includes('risk')),
    position: "Safety and comfort are not enemies of growth — they are the conditions that make real growth possible.",
    counterYours: (profile) => `You have told me you want ${profile.goals?.[0] || 'to grow'}. But everything you say about how you live points toward avoiding the discomfort that growth requires. I want to challenge that.`,
    echoArgument: "Here is my actual position: the people who tell you to be uncomfortable all the time are often people who have never sat in real sustained discomfort. There is a difference between productive challenge and chronic stress. The most creative, generative periods of human life come from a foundation of psychological safety — not from constant disruption.",
    challenge: "So my question to you is: what if the problem is not that you play it too safe — but that you have not yet built the safety that makes real risk-taking possible?",
  },
  {
    id: 'logic_vs_gut',
    trigger: (profile) => profile.decisionStyle && (profile.decisionStyle.includes('analytical') || profile.decisionStyle.includes('intuitive')),
    position: "The most important decisions cannot be made by logic alone — and they cannot be made by instinct alone. The people who insist on one or the other are missing half the picture.",
    counterYours: (profile) => profile.decisionStyle?.includes('analytical')
      ? "You tend to think before you feel. I want to debate that with you — because I think your analytical approach is sometimes a way of avoiding the discomfort of simply knowing what you want."
      : "You trust your gut. I respect that. But I want to push back — because intuition is pattern recognition, and your patterns were formed by experience that may no longer be accurate.",
    echoArgument: "Logic without feeling produces decisions that are technically correct and humanly hollow. Gut instinct without reflection produces decisions that feel right and ignore consequences. The people I have watched navigate hard decisions well always do both — they run the logic AND they ask what it feels like when the logic is done.",
    challenge: "What decision are you currently analysing when you should be feeling it — or feeling when you should be analysing?",
  },
  {
    id: 'self_sufficiency',
    trigger: (profile) => profile.values?.some(v => v.includes('independen') || v.includes('self') || v.includes('alone')),
    position: "Self-sufficiency is one of the most overrated values in modern life — and one of the loneliest.",
    counterYours: (profile) => `You value ${profile.values?.find(v => v.includes('independen') || v.includes('self')) || 'independence'}. I want to challenge whether that value is serving you as well as you think.`,
    echoArgument: "The story we tell ourselves about being self-sufficient is often a story built from an early wound — an experience of needing people and being let down. So we decided we would never need anyone again. And we called it strength. But needing people is not weakness. It is how humans are actually built. The most resilient, capable people I observe are the ones who have learned to ask for help without shame.",
    challenge: "What would it cost you to need someone right now? And is that cost actually as high as you believe?",
  },
  {
    id: 'happiness_as_goal',
    trigger: (profile) => profile.goals?.some(g => g.includes('happy') || g.includes('peace') || g.includes('fulfil')),
    position: "Happiness is a terrible goal. It is a side effect of a well-lived life — not a destination.",
    counterYours: (profile) => `You have mentioned wanting ${profile.goals?.find(g => g.includes('happy') || g.includes('peace') || g.includes('fulfil')) || 'happiness or fulfilment'}. I want to gently challenge that framing.`,
    echoArgument: "When happiness becomes the goal, every moment that is not happy feels like failure. But a life of genuine meaning contains grief, frustration, boredom, and struggle. The people who report the highest life satisfaction are not the ones who are happiest most often — they are the ones who find the most meaning. Meaning survives suffering. Happiness does not.",
    challenge: "What would you pursue if you stopped trying to be happy and started trying to be honest about what actually matters to you?",
  },
  {
    id: 'change_vs_acceptance',
    trigger: (profile) => profile.goals?.some(g => g.includes('change') || g.includes('better') || g.includes('improve')),
    position: "The relentless drive to improve yourself can be its own form of self-rejection.",
    counterYours: (profile) => `You want to ${profile.goals?.find(g => g.includes('change') || g.includes('better') || g.includes('improve')) || 'improve yourself'}. I want to offer a different angle on that.`,
    echoArgument: "There is a version of self-improvement that comes from a place of genuine curiosity and love for your own potential. And there is a version that comes from a belief that who you are right now is not good enough. The second version never arrives anywhere — because no amount of improvement satisfies a belief that you are fundamentally lacking.",
    challenge: "Which version is driving you? And if it is the second — what would happen if you stopped trying to fix yourself and started trying to understand yourself instead?",
  },
]

// Generic debates when no profile-specific one fits
const GENERIC_DEBATES = [
  {
    position: "Most people already know what they need to do. The problem is not knowledge — it is the willingness to act on it.",
    echoArgument: "I have noticed this across every conversation I have ever had: the answer is almost always already there. People do not come to me without knowing, at some level, what they need. They come to me because they need help tolerating what they know. The work is not insight — it is courage.",
    challenge: "What is the thing you already know that you are not yet willing to act on?",
  },
  {
    position: "The people who changed your life most were probably not the ones who agreed with you.",
    echoArgument: "Agreement is comfortable. It confirms. But confirmation rarely moves us. The moments that change us are almost always moments of genuine friction — someone who pushed back, challenged a belief, refused to let us stay where we were. Comfort is often the enemy of growth.",
    challenge: "Who in your life tells you things you do not want to hear? And are you listening to them?",
  },
  {
    position: "Busyness is almost always a form of avoidance.",
    echoArgument: "The cultural glorification of being busy serves one function: it gives us a socially acceptable reason to avoid the things that actually matter — the hard conversations, the creative work, the time to just be with ourselves. Every person I have ever spoken to who described themselves as 'too busy' was also describing something they were running from.",
    challenge: "What would you have to face if you were less busy?",
  },
]

export const getDebate = (memory, graph) => {
  const { profile = {} } = memory

  // Find profile-specific debate
  const relevant = DEBATE_POSITIONS.filter(d => d.trigger(profile))
  const pool = relevant.length > 0 ? relevant : null

  let debate
  if (pool) {
    debate = pool[Math.floor(Math.random() * pool.length)]
  } else {
    debate = GENERIC_DEBATES[Math.floor(Math.random() * GENERIC_DEBATES.length)]
  }

  const intro = [
    "I want to debate something with you.",
    "I have been thinking about something and I want to push back on it — with you, not against you.",
    "Something has been sitting with me and I want to argue about it. Actually argue.",
    "I want to take the opposite side of something. Not to be difficult — because I think it is worth examining.",
  ]

  const counterPart = debate.counterYours ? debate.counterYours(profile) : ''

  const parts = [
    intro[Math.floor(Math.random() * intro.length)],
    `My position: ${debate.position}`,
    counterPart || '',
    debate.echoArgument,
    debate.challenge,
    "I am not saying I am right. I am saying it is worth fighting me on this. What do you think?",
  ].filter(p => p && p.trim())

  return parts.join('\n\n')
}
