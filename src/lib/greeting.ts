import { readStorage, writeStorage } from './storage'
import type { User } from './session'

export const GREETING_TTL_MINUTES = 30
const greetingKey = 'greeting'
const greetingOptions = ['one', 'two', 'three', 'four', 'five'] as const
type GreetingOption = (typeof greetingOptions)[number]
type Greeting = {
  option: GreetingOption
  loginCount: number
  lastLoginAt: string
  changedAt: number
}

let currentGreeting = readGreeting()

function readGreeting(): Greeting | null {
  const saved = readStorage(greetingKey)
  if (!saved) return null

  try {
    const greeting: Greeting = JSON.parse(saved)
    if (
      greetingOptions.includes(greeting.option) &&
      Number.isSafeInteger(greeting.loginCount) &&
      typeof greeting.lastLoginAt === 'string' &&
      Number.isFinite(greeting.changedAt)
    ) return greeting
  } catch {
    // Regenerate the greeting when the saved value is invalid.
  }
  return null
}

export function getGreeting(user: User, now = Date.now()) {
  const group = user.loginCount === 1 ? 'first' : 'returning'
  if (
    currentGreeting?.loginCount === user.loginCount &&
    currentGreeting.lastLoginAt === user.lastLoginAt &&
    now - currentGreeting.changedAt < GREETING_TTL_MINUTES * 60_000
  ) {
    return `home.greetings.${group}.${currentGreeting.option}` as const
  }

  const options = greetingOptions.filter((option) => option !== currentGreeting?.option)
  const option = options[Math.floor(Math.random() * options.length)]
  currentGreeting = { option, loginCount: user.loginCount, lastLoginAt: user.lastLoginAt, changedAt: now }
  writeStorage(greetingKey, JSON.stringify(currentGreeting))
  return `home.greetings.${group}.${option}` as const
}
