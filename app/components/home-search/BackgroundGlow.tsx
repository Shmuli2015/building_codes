"use client";

import { motion, useReducedMotion } from "framer-motion";

export function BackgroundGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -top-32 left-1/2 h-80 w-[36rem] max-w-none -translate-x-1/2 rounded-full bg-linear-to-br from-blue-400/25 via-indigo-300/20 to-transparent blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
                scale: [1, 1.12, 1],
                x: ["-50%", "-50%", "-50%"],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -left-16 h-72 w-80 rounded-full bg-linear-to-tr from-violet-400/20 to-indigo-400/15 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
                scale: [1, 1.08, 1],
                x: [0, 12, 0],
                y: [0, -8, 0],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 right-0 h-64 w-72 rounded-full bg-cyan-400/15 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
                opacity: [0.35, 0.6, 0.35],
                scale: [1, 1.05, 1],
              }
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
