'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { BackgroundAnimation } from '@/components/BackgroundAnimation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { History, Play, Clock, Calendar, Wallet, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

export default function HistoryPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const [watchHistory, setWatchHistory] = useState([])
  const [activeRentals, setActiveRentals] = useState([])
  const [moviesMap, setMoviesMap] = useState({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: userRentals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getWatchHistory',
    args: [address],
    enabled: !!address,
  })

  const { data: userActiveRentals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveRentals',
    args: [address],
    enabled: !!address,
  })

  const { data: allMovies, isLoading: isLoadingMovies } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllMovies',
    enabled: !!(userRentals || userActiveRentals),
  })

  useEffect(() => {
    if (allMovies) {
      const movieMap = allMovies.reduce((acc, movie) => {
        acc[Number(movie.id)] = movie
        return acc
      }, {})
      setMoviesMap(movieMap)
    }
  }, [allMovies])

  useEffect(() => {
    if (userRentals) {
      setWatchHistory([...userRentals].sort((a, b) => Number(b.rentedAt) - Number(a.rentedAt)))
    }
  }, [userRentals])

  useEffect(() => {
    if (userActiveRentals) {
      setActiveRentals(userActiveRentals)
    }
  }, [userActiveRentals])

  const formatDate = (timestamp) => new Date(Number(timestamp) * 1000).toLocaleDateString()
  const formatDuration = (duration) => `${Number(duration) / 3600} Hours`

  const getRemainingTime = (rentedAt, duration) => {
    const expiryTime = (Number(rentedAt) + Number(duration)) * 1000
    const remaining = expiryTime - Date.now()
    if (remaining <= 0) return { text: 'Expired', active: false }
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((remaining / (1000 * 60)) % 60)
    if (days > 0) return { text: `${days}d ${hours}h remaining`, active: true }
    if (hours > 0) return { text: `${hours}h ${minutes}m remaining`, active: true }
    return { text: `${minutes}m remaining`, active: true }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-400" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 max-w-md text-center">
          <CardHeader>
            <Wallet className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl font-bold">Connect Your Wallet</CardTitle>
            <CardDescription className="text-gray-400">Please connect your wallet to view your rental history.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white py-12 pt-24 md:py-16 md:pt-28 overflow-hidden">
      <BackgroundAnimation />
      {/* Background Animation positioned behind everything */}
      {/* <div className="absolute inset-0 z-[-1]">
        
      </div> */}

      <motion.div
        className="relative max-w-7xl mx-auto px-4 z-[1]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">My Rentals</h1>
          <p className="text-gray-400 text-lg">Manage your active rentals and review your watch history.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
              <TabsTrigger value="active">Active Rentals</TabsTrigger>
              <TabsTrigger value="history">Full History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader><CardTitle>Currently Rented</CardTitle></CardHeader>
                <CardContent>
                  {activeRentals.length === 0 ? (
                    <div className="text-center py-16">
                      <Play className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No Active Rentals</h4>
                      <p className="text-gray-400 mb-4">Rent a movie to watch it here.</p>
                      <Link href="/explore"><Button className="bg-teal-500 hover:bg-teal-600 font-bold">Explore Movies</Button></Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeRentals.map((rental, index) => {
                        const movie = moviesMap[Number(rental.movieId)]
                        if (!movie) return null
                        const timeLeft = getRemainingTime(rental.rentedAt, rental.duration)
                        return (
                          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-teal-500 transition-colors duration-300 overflow-hidden group h-full flex flex-col">
                              <CardHeader className="p-0">
                                <div className="aspect-video overflow-hidden">
                                  <motion.img
                                    src={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : `/placeholder.svg?text=${encodeURIComponent(movie.title)}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.4 }}
                                  />
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 flex flex-col flex-grow">
                                <h4 className="font-semibold text-lg truncate mb-2">{movie.title}</h4>
                                <div className="flex items-center gap-2 text-sm bg-teal-500/10 text-teal-300 px-3 py-1 rounded-full w-fit">
                                  <Clock className="h-4 w-4" />
                                  <span>{timeLeft.text}</span>
                                </div>
                                <div className="mt-auto pt-4">
                                  <Link href={`/movie/${movie.id}`}>
                                    <Button className="w-full bg-teal-500 hover:bg-teal-600 font-bold"><Play className="mr-2 h-4 w-4" /> Watch Now</Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader><CardTitle>All Rented Movies</CardTitle></CardHeader>
                <CardContent>
                  {isLoadingMovies ? (
                     <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                  ) : watchHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <History className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No Watch History</h4>
                      <p className="text-gray-400">Your past rentals will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {watchHistory.map((rental, index) => {
                        const movie = moviesMap[Number(rental.movieId)]
                        if (!movie) return null
                        const timeLeft = getRemainingTime(rental.rentedAt, rental.duration)
                        return (
                          <motion.div key={index} variants={itemVariants}>
                            <Card className="bg-gray-800 border-gray-700 p-4 transition-colors hover:border-gray-600">
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-32 sm:w-28 flex-shrink-0">
                                  <img src={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : `/placeholder.svg?text=${encodeURIComponent(movie.title)}`} alt={movie.title} className="w-full h-full object-cover rounded-md aspect-video" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                  <h4 className="text-white font-semibold text-lg">{movie.title}</h4>
                                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">{movie.genre}</Badge>
                                    <Badge variant="secondary" className={timeLeft.active ? "bg-teal-500/20 text-teal-300" : "bg-gray-700 text-gray-400"}>
                                      {timeLeft.active ? "Active" : "Expired"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 text-center sm:text-left">
                                    <p className="text-sm text-gray-400 flex items-center gap-2"><Calendar className="h-4 w-4" /> Rented: {formatDate(rental.rentedAt)}</p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2"><Clock className="h-4 w-4" /> Duration: {formatDuration(rental.duration)}</p>
                                </div>
                                <div className="flex-shrink-0">
                                  <Link href={`/movie/${movie.id}`}>
                                    <Button className={timeLeft.active ? "bg-teal-500 hover:bg-teal-600 font-bold" : "bg-cyan-500 hover:bg-cyan-600 font-bold"}>
                                      {timeLeft.active ? "Watch Now" : "View Details"}
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}
