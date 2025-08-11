'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion } from 'framer-motion'
import { parseEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Clock, Star, User, DollarSign, Loader2, CheckCircle, Info, Video, Wallet, XCircle } from 'lucide-react'
import { CONTRACT_ADDRESS, CONTRACT_ABI, handleContractError } from '@/lib/contract'
import { useToast } from '@/hooks/use-toast'

const Loader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-teal-400" />
  </div>
)

export default function MoviePage() {
  const [isMounted, setIsMounted] = useState(false)
  const { id } = useParams()
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [selectedDuration, setSelectedDuration] = useState('48h')
  const [movie, setMovie] = useState(null)
  const [pricing, setPricing] = useState(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: movieData, isLoading: isLoadingMovie } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMovie',
    args: [BigInt(id)],
  })

  const { data: hasRental, refetch: refetchHasRental } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasActiveRental',
    args: [address, BigInt(id)],
    enabled: !!address,
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (movieData) {
      setMovie(movieData[0])
      setPricing({ '48h': movieData[1], '72h': movieData[2], '1w': movieData[3] })
    }
  }, [movieData])

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Rental Successful!",
        description: "You now have access to watch this movie.",
      })
      refetchHasRental() // Refetch rental status after success
    }
  }, [isSuccess, toast, refetchHasRental])

  const formatPrice = (price) => (Number(price) / 1e18).toFixed(4)
  const getDurationInSeconds = (d) => ({ '48h': 172800, '72h': 259200, '1w': 604800 }[d])

  const handleRent = async () => {
    if (!isConnected || !movie || !pricing) return
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'rentMovie',
        args: [BigInt(id), BigInt(getDurationInSeconds(selectedDuration))],
        value: pricing[selectedDuration],
      })
    } catch (error) {
      toast({ title: "Rental Failed", description: handleContractError(error), variant: "destructive" })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  if (!isMounted || isLoadingMovie) {
    return <Loader />
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 max-w-md text-center">
          <CardHeader>
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl font-bold">Movie Not Found</CardTitle>
            <CardDescription className="text-gray-400">Could not find a movie with the specified ID.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 pt-24 md:py-16 md:pt-28">
      <motion.div
        className="max-w-7xl mx-auto px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Player and Details */}
          <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
              <div className="aspect-video bg-black flex items-center justify-center relative">
                {hasRental ? (
                  <>
                    <img src={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : `/placeholder.svg?text=${encodeURIComponent(movie.title)}`} alt={movie.title} className="w-full h-full object-cover blur-sm brightness-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <CheckCircle className="h-20 w-20 text-teal-400 mb-4" />
                      <h2 className="text-3xl font-bold">You have access to this movie</h2>
                      <p className="text-gray-300 mt-2">Enjoy your rental!</p>
                      <Button size="lg" className="mt-6 bg-teal-500 hover:bg-teal-600 font-bold"><Play className="mr-2 h-5 w-5" /> Watch Now</Button>
                    </div>
                  </>
                ) : movie.trailerCID ? (
                  <video controls className="w-full h-full" poster={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : ''}>
                    <source src={`https://gateway.pinata.cloud/ipfs/${movie.trailerCID}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : `/placeholder.svg?text=${encodeURIComponent(movie.title)}`} alt={movie.title} className="w-full h-full object-cover" />
                )}
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-4xl font-extrabold mb-3">{movie.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className="bg-cyan-500 text-white">{movie.genre || 'N/A'}</Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">{movie.language || 'N/A'}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400 text-lg font-semibold bg-gray-900 px-3 py-1.5 rounded-lg shrink-0">
                    <Star className="h-5 w-5 fill-current" />
                    <span>{Number(movie.rentalCount)} Rentals</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-base leading-relaxed mb-6">{movie.description || 'No description available.'}</p>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-700">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="owner">Ownership</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="mt-4 text-gray-300">
                    <div className="flex items-center gap-2"><Info className="h-4 w-4 text-cyan-400" />Movie ID: #{Number(movie.id)}</div>
                  </TabsContent>
                  <TabsContent value="owner" className="mt-4 text-gray-300">
                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-cyan-400" />Owner: <span className="font-mono text-sm break-all">{movie.owner}</span></div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Rental Card */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <div className="lg:sticky lg:top-28">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Video className="h-6 w-6 text-teal-400" />
                    Rent This Movie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasRental ? (
                    <div className="text-center py-6">
                      <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4">
                        <p className="text-teal-300 font-semibold">You already own this rental.</p>
                        <p className="text-gray-400 text-sm">Go to your History to see time remaining.</p>
                      </div>
                    </div>
                  ) : pricing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {['48h', '72h', '1w'].map(key => (
                          <button key={key} onClick={() => setSelectedDuration(key)} className={`text-center p-3 rounded-lg transition-all text-sm font-bold ${selectedDuration === key ? 'bg-teal-500 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}>
                            {key === '1w' ? '1 Week' : `${key.replace('h', '')} Hrs`}
                          </button>
                        ))}
                      </div>
                      <div className="text-center py-3">
                        <p className="text-gray-400 text-sm">Price</p>
                        <p className="text-4xl font-bold text-teal-400">{formatPrice(pricing[selectedDuration])} <span className="text-2xl">CAMP</span></p>
                      </div>
                      <Button onClick={handleRent} disabled={!isConnected || isPending || isConfirming || address === movie.owner} size="lg" className="w-full bg-teal-500 hover:bg-teal-600 font-bold text-lg h-14 disabled:bg-gray-600">
                        {
                          !isConnected ? <><Wallet className="mr-2 h-5 w-5" />Connect Wallet</> :
                          address === movie.owner ? <><XCircle className="mr-2 h-5 w-5" />Cannot Rent Own Movie</> :
                          isPending || isConfirming ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> :
                          <><Play className="mr-2 h-5 w-5" />Rent Now</>
                        }
                      </Button>
                      <div className="text-xs text-gray-500 text-center pt-2">
                        <p>90% goes to the owner, 10% to the platform.</p>
                        <p>Instant access after blockchain confirmation.</p>
                      </div>
                    </div>
                  ) : <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}