export interface SpiritualQuote {
  text: string
  author: string
}

export const spiritualQuotes: SpiritualQuote[] = [
  {
    text: "I am the source of all spiritual and material worlds. Everything emanates from Me.",
    author: "Bhagavad Gita 10.8"
  },
  {
    text: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    author: "Bhagavad Gita 18.66"
  },
  {
    text: "The mind is restless and difficult to restrain, but it is subdued by constant practice and detachment.",
    author: "Bhagavad Gita 6.35"
  },
  {
    text: "You have a right to perform your prescribed duty, but not to the fruits of action.",
    author: "Bhagavad Gita 2.47"
  },
  {
    text: "The soul is neither born, and nor does it die. It is unborn, eternal, ever-existing and primeval.",
    author: "Bhagavad Gita 2.20"
  },
  {
    text: "The divine name has the power to purify the heart and bring peace to the soul.",
    author: "Spiritual Wisdom"
  },
  {
    text: "Through constant remembrance of the divine, we find our true purpose in life.",
    author: "Spiritual Wisdom"
  },
  {
    text: "Every jap brings you closer to the divine. Your dedication is your strength.",
    author: "Divine Inspiration"
  }
]

export function getDailyQuote(): SpiritualQuote {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  
  const quoteIndex = dayOfYear % spiritualQuotes.length
  return spiritualQuotes[quoteIndex]
}
