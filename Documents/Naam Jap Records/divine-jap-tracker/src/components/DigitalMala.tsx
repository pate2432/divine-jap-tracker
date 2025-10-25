'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DigitalMalaProps {
  currentCount: number
  onCountChange: (count: number) => void
}

export default function DigitalMala({ currentCount, onCountChange }: DigitalMalaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(currentCount.toString())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
  }

  const handleSubmit = () => {
    const newCount = parseInt(inputValue) || 0
    onCountChange(newCount)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setInputValue(currentCount.toString())
      setIsEditing(false)
    }
  }

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
      setInputValue(currentCount.toString())
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      >
        {isEditing ? (
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={handleSubmit}
            className="w-24 h-16 bg-transparent text-white text-3xl font-bold text-center border-none outline-none"
            autoFocus
          />
        ) : (
          currentCount
        )}
      </motion.div>
      
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">
          {isEditing ? 'Enter count and press Enter' : 'Click to edit count'}
        </p>
        <p className="text-sm text-gray-500">Current count: {currentCount}</p>
      </div>
    </div>
  )
}
