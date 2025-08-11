'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, Star, TrendingUp, Upload, Film, BarChart } from 'lucide-react'
import Link from 'next/link'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [featuredMovies, setFeaturedMovies] = useState([])

  const { data: allMovies } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllMovies',
  })

  const { data: platformStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlatformStats',
  })

  useEffect(() => {
    if (allMovies && allMovies.length > 0) {
      // Sort by rental count and take top 6 for featured
      const sorted = [...allMovies]
        .sort((a, b) => Number(b.rentalCount) - Number(a.rentalCount))
        .slice(0, 6)
      setFeaturedMovies(sorted)
    }
  }, [allMovies])

  const formatPrice = (price) => {
    return (Number(price) / 1e18).toFixed(4)
  }

  // Animation Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-80"></div>
        <motion.div
          className="max-w-7xl mx-auto text-center relative"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            The Future of
            <span className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              {' '}
              Cinema is Here
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Upload, rent, and remix movies on the blockchain. Join the revolution in decentralized entertainment.
          </p>

          {isConnected ? (
            <motion.div
              className="flex gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/explore">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Movies
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-bold">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Movie
                </Button>
              </Link>
            </motion.div>
          ) : (
            <p className="text-gray-400">Connect your wallet to get started</p>
          )}
        </motion.div>
      </section>

      {/* Platform Stats */}
      {platformStats && (
        <motion.section
          className="py-12 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <CardHeader>
                    <BarChart className="h-10 w-10 mx-auto text-teal-400 mb-2" />
                    <CardTitle className="text-3xl font-bold">{Number(platformStats[0])}</CardTitle>
                    <CardDescription className="text-gray-400">Total Movies</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <CardHeader>
                    <Film className="h-10 w-10 mx-auto text-cyan-400 mb-2" />
                    <CardTitle className="text-3xl font-bold">{Number(platformStats[1])}</CardTitle>
                    <CardDescription className="text-gray-400">Total Remixes</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <CardHeader>
                    <TrendingUp className="h-10 w-10 mx-auto text-pink-500 mb-2" />
                    <CardTitle className="text-3xl font-bold">{formatPrice(platformStats[2])} CAMP</CardTitle>
                    <CardDescription className="text-gray-400">Upload Fee</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Featured Movies */}
      {featuredMovies.length > 0 && (
        <section className="py-20 px-4 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <TrendingUp className="h-8 w-8 text-teal-400" />
              <h2 className="text-4xl font-bold">Trending Movies</h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {featuredMovies.map((movie) => (
                <motion.div key={movie.id} variants={itemVariants} whileHover={{ y: -10 }}>
                  <Card className="bg-gray-800 border-gray-700 hover:border-teal-500 transition-colors duration-300 overflow-hidden group">
                    <CardHeader className="p-0">
                      <div className="aspect-video overflow-hidden">
                        <motion.img
                          src={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(movie.title + ' movie poster')}`}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(movie.title + ' movie poster')}`
                          }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-xl truncate">{movie.title}</h3>
                        <Badge variant="secondary" className="bg-cyan-500 text-white shrink-0">
                          {movie.genre}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{movie.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{Number(movie.rentalCount)} rentals</span>
                        </div>
                        <div className="font-semibold text-teal-400">
                          {formatPrice(movie.price48h)} CAMP
                        </div>
                      </div>
                      <Link href={`/movie/${movie.id}`}>
                        <Button className="w-full mt-4 bg-teal-500 hover:bg-teal-600 font-bold">
                          <Play className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <Link href="/explore">
                <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-bold">
                  View All Movies
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Platform Features
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="bg-teal-500/20 p-3 rounded-full">
                      <Play className="h-6 w-6 text-teal-400" />
                    </div>
                    Rent Movies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Rent movies for 48 hours, 72 hours, or 1 week with transparent pricing and instant access.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="bg-cyan-500/20 p-3 rounded-full">
                     <Upload className="h-6 w-6 text-cyan-400" />
                    </div>
                    Upload Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Upload your movies to IPFS and earn from rentals with automatic revenue sharing.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="bg-pink-500/20 p-3 rounded-full">
                      <Star className="h-6 w-6 text-pink-400" />
                    </div>
                    Create Remixes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Create and share remixes of existing content for social engagement and creativity.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}