'use client'

import { motion } from 'framer-motion'

const messages = [
  "Premium Doctor Scrubs in Pakistan, Medical Equipment & Student Practice Kits",
  "Pakistan's Trusted Store for Doctor Scrubs, Medical Equipment & Clogs",
  "Buy top-quality scrubs, clogs & medical practice tools online",
  "Medical student kits, doctor scrubs & healthcare equipment PK"
]

export default function ScrollingTextBanner() {
  return (
    <div className="relative w-full bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 py-3 sm:py-4 overflow-hidden shadow-lg">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white rounded-full blur-3xl" />
      </div>

      {/* Scrolling text container */}
      <div className="relative flex whitespace-nowrap">
        {/* First set of messages */}
        <motion.div
          className="flex items-center gap-8 sm:gap-12"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {messages.map((message, index) => (
            <div key={`first-${index}`} className="flex items-center gap-8 sm:gap-12">
              <span className="text-white font-semibold text-sm sm:text-base lg:text-lg px-4">
                {message}
              </span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Second set of messages (for seamless loop) */}
        <motion.div
          className="flex items-center gap-8 sm:gap-12"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {messages.map((message, index) => (
            <div key={`second-${index}`} className="flex items-center gap-8 sm:gap-12">
              <span className="text-white font-semibold text-sm sm:text-base lg:text-lg px-4">
                {message}
              </span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Third set for extra smoothness */}
        <motion.div
          className="flex items-center gap-8 sm:gap-12"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {messages.map((message, index) => (
            <div key={`third-${index}`} className="flex items-center gap-8 sm:gap-12">
              <span className="text-white font-semibold text-sm sm:text-base lg:text-lg px-4">
                {message}
              </span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
