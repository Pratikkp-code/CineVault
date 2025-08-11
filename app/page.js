'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clapperboard, Film, Users } from 'lucide-react'
import { BackgroundAnimation } from '@/components/BackgroundAnimation' // <-- Import the new component

// Main Component for your Login/Choice Page
export default function PortalChoicePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    // Add `relative` to contain the absolutely positioned background
    <div className="relative min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-8 text-white overflow-hidden">
      
      {/* RENDER THE ANIMATED BACKGROUND */}
      <BackgroundAnimation />
      
      {/* All the foreground content needs a z-index to appear on top */}
      <motion.div
        className="text-center w-full max-w-4xl z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Main Logo and Title */}
        <motion.div variants={itemVariants} className="mb-12">
          <Clapperboard className="h-14 w-14 mx-auto text-cyan-300" />
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mt-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            CINEVAULT
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mt-4">
            The future of film is here. Choose your portal to begin your journey into decentralized entertainment.
          </p>
        </motion.div>

        {/* Portal Cards Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Creator Portal */}
          <Link href="/profile" passHref className="group">
            <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-teal-400 group-hover:bg-[#1f2630]">
              <Film className="h-16 w-16 text-teal-400 mb-6 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="text-3xl font-bold mb-2">Creator Portal</h2>
              <p className="text-gray-400 text-base">
                Upload movies, track rentals, and manage your profile.
              </p>
            </div>
          </Link>

          {/* Viewer Portal */}
          <Link href="/explore" passHref className="group">
            <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-cyan-400 group-hover:bg-[#1f2630]">
              <Users className="h-16 w-16 text-cyan-400 mb-6 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="text-3xl font-bold mb-2">Viewer Portal</h2>
              <p className="text-gray-400 text-base">
                Explore films, rent your favorites, and view your history.
              </p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}