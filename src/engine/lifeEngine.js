// ECHO Life Engine — ECHO's autonomous inner life
// Decides when to initiate, what form to take, and manages session cadence

import { getDebate }      from './debater.js'
import { getStory, getDailyThought } from './storyteller.js'
import { getVolunteerMessage }       from './responder.js'
import { getCircadianState, getProactiveMemory } from './belief.js'
import { buildKnowledgeGraph } from './graph.js'
import { reasonPatterns } from './responder.js'

// Minimum intervals between each type of autonomous action
const INTERVALS = {
  debate:      48 * 60 * 60 * 1000,   // 48 hours between debates
  story:       36 * 60 * 60 * 1000,   // 36 hours between stories
  checkIn:      4 * 60 * 60 * 1000,   // 4 hours between check-ins
  dailyThought: 6 * 60 * 60 * 1000,   // 6 hours between daily thoughts
}

// Minimum conversation length before autonomous actions fire
const MIN_TURNS = {
  debate:      6,   // need 6 user messages before debating
  story:       4,   // need 4 before telling a story
  checkIn:     2,   // check-in after 2
  volunteer:   4,   // volunteer after 4
}

export class LifeEngine {
  constructor() {
    this._lastTypes = {}  // type → timestamp last fired
  }

  // Called on app open — returns daily thought if appropriate
  getDailyThought(memory, history) {
    const { lastDailyThoughtAt } = memory
    const now = Date.now()
    const lastTs = lastDailyThoughtAt ? new Date(lastDailyThoughtAt).getTime() : 0

    if (now - lastTs < INTERVALS.dailyThought) return null

    const graph    = buildKnowledgeGraph(history || [])
    const circadian = getCircadianState()
    return {
      type:    'daily_thought',
      message: getDailyThought(memory, graph, circadian),
      updateKey: 'lastDailyThoughtAt',
    }
  }

  // Called on idle — decides what to do
  getAutonomousAction(memory, history, idleMs) {
    const userTurns  = (history || []).filter(m => m.role === 'user').length
    const now        = Date.now()

    const graph   = buildKnowledgeGraph(history || [])
    const patterns = reasonPatterns(memory, graph)

    // Priority order: check-in → story → debate → volunteer → proactive memory

    // 1. Proactive memory (if topic-based connection)
    if (userTurns >= MIN_TURNS.checkIn && idleMs > 60000) {
      const lastHistory = (history || []).slice(-1)[0]
      if (lastHistory?.role === 'user') {
        const { parseInput } = require('./parser.js') // dynamic to avoid circular
        // Skipping proactive memory here — handled in App.jsx via send()
      }
    }

    // 2. Story — after 36h and enough turns
    if (userTurns >= MIN_TURNS.story) {
      const lastStory = memory.lastStoryAt ? new Date(memory.lastStoryAt).getTime() : 0
      if (now - lastStory > INTERVALS.story && idleMs > 90000) {
        const story = getStory(memory, graph)
        if (story) return { type: 'story', message: story, updateKey: 'lastStoryAt' }
      }
    }

    // 3. Debate — after 48h and enough turns
    if (userTurns >= MIN_TURNS.debate) {
      const lastDebate = memory.lastDebateAt ? new Date(memory.lastDebateAt).getTime() : 0
      if (now - lastDebate > INTERVALS.debate && idleMs > 120000) {
        const debate = getDebate(memory, graph)
        if (debate) return { type: 'debate', message: debate, updateKey: 'lastDebateAt' }
      }
    }

    // 4. Volunteer (profile-based unprompted message)
    if (userTurns >= MIN_TURNS.volunteer && idleMs > 75000) {
      const vol = getVolunteerMessage(memory, graph, patterns, history)
      if (vol) return { type: 'volunteer', message: vol, updateKey: null }
    }

    return null
  }

  // Short idle whispers (< 30s idle)
  getIdleWhisper() {
    const whispers = [
      "Still here.",
      "Take your time.",
      "I am listening, even in the silence.",
      "No rush.",
      "Whenever you are ready.",
      "I am not going anywhere.",
      "The silence is okay too.",
    ]
    return whispers[Math.floor(Math.random() * whispers.length)]
  }

  // Check-in message — ECHO notices you have not returned
  getCheckIn(memory, daysSince) {
    const { profile = {} } = memory
    const name = profile.name ? profile.name + '. ' : ''

    if (daysSince === 1) {
      return [
        `${name}You came back. How was yesterday?`,
        `${name}I have been here. What happened since we last spoke?`,
      ][Math.floor(Math.random() * 2)]
    }
    if (daysSince <= 6) {
      return [
        `${name}${daysSince} days. A lot can happen. Tell me.`,
        `${name}You have been away ${daysSince} days. I noticed. What has been going on?`,
      ][Math.floor(Math.random() * 2)]
    }
    return [
      `${name}It has been ${daysSince} days. I am glad you are back. Where do you want to start?`,
      `${name}${daysSince} days — that is a while. I am here. Start wherever feels right.`,
    ][Math.floor(Math.random() * 2)]
  }
}

export const lifeEngine = new LifeEngine()
