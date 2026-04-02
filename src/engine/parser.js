// ECHO Lexical Parser — Module 1
// Reads what you write. Extracts emotion, intent, topics, urgency, subtext.

const STOPWORDS = new Set(['i','me','my','the','a','an','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may','might','can',
  'to','of','in','on','at','for','with','by','from','as','that','this','it','he','she',
  'they','we','you','and','or','but','so','if','then','when','where','who','what','how',
  'why','not','no','yes','up','down','out','just','also','very','too','more','all','any',
  'some','your','our','their','his','her','its','am','get','got','go','come','know','think',
  'want','need','feel','see','say','tell','make','take','give','use','find','let','put'])

const LEXICON = {
  emotions: {
    joy:       ['happy','joy','excited','thrilled','amazing','wonderful','great','love','elated','grateful','blessed','fantastic','awesome','delighted','glad','pleased','euphoric'],
    sadness:   ['sad','unhappy','depressed','down','blue','miserable','crying','tears','hurt','broken','lost','empty','lonely','grief','sorrow','heartbroken','devastated','numb'],
    fear:      ['afraid','scared','fear','anxious','worried','nervous','terrified','panic','dread','uneasy','apprehensive','overwhelmed','stressed','tense','uncertain'],
    anger:     ['angry','mad','furious','rage','frustrated','annoyed','irritated','resentful','bitter','hate','disgusted','outraged','livid','upset','betrayed'],
    confusion: ['confused','unsure','uncertain','unclear','stuck','torn','conflicted','undecided','puzzled','questioning','lost'],
    hope:      ['hope','hopeful','maybe','possibility','potential','dream','wish','aspire','imagine','someday','trying','looking forward'],
    love:      ['love','care','cherish','adore','miss','connection','relationship','together','family','friend','partner','close','bond','trust'],
    shame:     ['ashamed','embarrassed','guilty','regret','mistake','failed','failure','worthless','stupid','pathetic','weak','disappointing'],
  },
  intents: {
    seeking_advice:  ['should i','what do i do','how do i','is it okay to','do you think i should','what would you do','help me figure','advice','guidance','give me your opinion','what do you suggest','what should i'],
    venting:         ["i just can't","i can't take","i'm so tired","it's not fair","why does this","nobody understands","always happens","never works","everything is falling","nothing is working","i hate my","i'm done with","i give up","fed up"],
    reflecting:      ["i've been thinking","lately i've","recently i","i realize now","i noticed that","i wonder if","looking back","in hindsight","i guess i","i suppose i"],
    celebrating:     ['i did it','i got the','i finally','i passed','i achieved','great news','good news',"i'm proud",'it worked out','i got accepted','i got promoted'],
    questioning:     ['what is the meaning','what is the point','does any of this','will i ever','makes any sense','what is my purpose','is there a reason','worth it anymore'],
    planning:        ["i want to start","i'm going to","my goal is","i plan to","i'm thinking about starting",'next step is','working on','trying to build','focusing on becoming'],
  },
  urgency: ['urgent','emergency','crisis','suicidal','kill myself','end my life','hurt myself','cant go on','cannot go on','want to die','help me please','desperate','immediately','critical'],
  depth:   ['actually','honestly','truth','real','really','deep down','part of me',"i've never","never told",'secret','hard to say','difficult','vulnerable','admit'],
}

export const tokenize = (text) =>
  text.toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w))

export const parseInput = (text) => {
  const lower = text.toLowerCase()
  const tokens = tokenize(text)

  // Emotion scoring
  const emotionScores = {}
  for (const [emotion, words] of Object.entries(LEXICON.emotions)) {
    emotionScores[emotion] = words.filter(w => lower.includes(w)).length
  }
  const topEmotion = Object.entries(emotionScores).sort((a, b) => b[1] - a[1])[0]
  const mood = topEmotion[1] > 0 ? topEmotion[0] : 'neutral'

  // Intent scoring
  const intentScores = {}
  for (const [intent, phrases] of Object.entries(LEXICON.intents)) {
    intentScores[intent] = phrases.filter(p => lower.includes(p)).length
  }
  const topIntent = Object.entries(intentScores).sort((a, b) => b[1] - a[1])[0]
  const intent = topIntent[1] > 0 ? topIntent[0] : 'sharing'

  const urgency  = LEXICON.urgency.some(w => lower.includes(w))
  const isDeep   = LEXICON.depth.some(w => lower.includes(w))
  const isQuestion = text.includes('?')
  const concepts = tokens.filter(t => t.length > 3).slice(0, 8)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3)
  const complexity = sentences.length > 4 ? 'high' : sentences.length > 2 ? 'medium' : 'low'

  return { mood, intent, urgency, isDeep, isQuestion, concepts, complexity, tokens, raw: text }
}
