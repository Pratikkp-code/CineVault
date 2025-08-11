'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { User, Edit, Film, Upload, Star, BarChart, DollarSign, Wallet, Loader2, Play } from 'lucide-react'
import Link from 'next/link'
import { CONTRACT_ADDRESS, CONTRACT_ABI, handleContractError } from '@/lib/contract'
import { uploadToPinata } from '@/lib/pinata'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  // --- FIX START: State to track client-side mounting ---
  const [isMounted, setIsMounted] = useState(false)
  // --- FIX END ---

  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({ username: '', logoCID: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [userMovies, setUserMovies] = useState([])

  const { data: userProfile, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address,
  })

  const { data: movieIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMoviesByOwner',
    args: [address],
    enabled: !!address,
  })

  const { data: allMovies } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllMovies',
    enabled: !!movieIds,
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // --- FIX START: Effect to set mounted state on client ---
  useEffect(() => {
    setIsMounted(true)
  }, [])
  // --- FIX END ---

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        username: userProfile.username || '',
        logoCID: userProfile.logoCID || ''
      })
    }
  }, [userProfile])

  useEffect(() => {
    if (movieIds && allMovies) {
      const movies = allMovies.filter(movie => movieIds.some(id => Number(id) === Number(movie.id)))
      setUserMovies(movies)
    }
  }, [movieIds, allMovies])

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
      refetchProfile()
    }
  }, [isSuccess, toast, refetchProfile])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      let logoCID = profileData.logoCID
      if (logoFile) {
        toast({ title: "Uploading Logo...", description: "Please wait while we upload your new profile picture." })
        logoCID = await uploadToPinata(logoFile)
      }
      const functionName = userProfile?.exists ? 'updateUserProfile' : 'createUserProfile'
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName,
        args: [profileData.username, logoCID || ''],
      })
    } catch (error) {
      const errorMessage = handleContractError(error)
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    }
  }

  const formatPrice = (price) => (Number(price) / 1e18).toFixed(4)
  const totalRentals = userMovies.reduce((sum, movie) => sum + Number(movie.rentalCount), 0)
  const totalEarnings = userMovies.reduce((sum, movie) => sum + (Number(movie.rentalCount) * Number(movie.price48h) * 0.9), 0)

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  // --- FIX START: Gate rendering until component is mounted on the client ---
  if (!isMounted) {
    // Render a loader or null on the server and initial client render
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-400" />
      </div>
    )
  }
  // --- FIX END ---

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 max-w-md text-center">
          <CardHeader>
            <Wallet className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl font-bold">Connect Your Wallet</CardTitle>
            <CardDescription className="text-gray-400">Please connect your wallet to create or view your profile.</CardDescription>
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
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ... The rest of your component code remains exactly the same ... */}
          <motion.div className="lg:col-span-4" variants={itemVariants}>
            <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
              <CardHeader className="text-center items-center flex flex-col">
                <div className="relative w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center overflow-hidden border-4 border-gray-800">
                    {profileData.logoCID ? (
                      <img src={`https://gateway.pinata.cloud/ipfs/${profileData.logoCID}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{profileData.username || 'Anonymous User'}</CardTitle>
                <CardDescription className="text-sm font-mono break-all mt-1">{address}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {!isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(true)} className="w-full bg-teal-500 hover:bg-teal-600 font-bold">
                      <Edit className="mr-2 h-4 w-4" />
                      {userProfile?.exists ? 'Edit Profile' : 'Create Profile'}
                    </Button>
                    <div className="mt-6 space-y-4">
                      <h3 className="font-semibold text-lg text-white">Your Stats</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-400"><Film className="h-4 w-4" /> Movies Uploaded</span>
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">{userMovies.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-400"><Star className="h-4 w-4" /> Total Rentals</span>
                        <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">{totalRentals}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-400"><DollarSign className="h-4 w-4" /> Total Earnings</span>
                        <Badge variant="secondary" className="bg-teal-500/20 text-teal-300">{formatPrice(totalEarnings)} CAMP</Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={profileData.username} onChange={(e) => setProfileData(p => ({ ...p, username: e.target.value }))} placeholder="Enter your username" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo">Profile Picture</Label>
                      <Input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={isPending || isConfirming} className="flex-1 bg-teal-500 hover:bg-teal-600 font-bold">
                        {isPending || isConfirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                      </Button>
                      <Button type="button" onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="lg:col-span-8" variants={itemVariants}>
            <Tabs defaultValue="movies" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
                <TabsTrigger value="movies">My Movies</TabsTrigger>
                <TabsTrigger value="activity">Activity (Coming Soon)</TabsTrigger>
              </TabsList>

              <TabsContent value="movies" className="mt-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Your Uploads</CardTitle>
                    <Link href="/upload">
                      <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-bold">
                        <Upload className="mr-2 h-4 w-4" /> Upload New Movie
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {userMovies.length === 0 ? (
                      <div className="text-center py-16">
                        <Film className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                        <h4 className="text-lg font-semibold mb-2">You haven't uploaded any movies yet.</h4>
                        <p className="text-gray-400 mb-4">Start sharing your creations with the world!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userMovies.map((movie) => (
                          <motion.div key={movie.id} whileHover={{ y: -5 }}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-teal-500 transition-colors duration-300 overflow-hidden group h-full flex flex-col">
                              <CardHeader className="p-0">
                                <div className="aspect-video overflow-hidden">
                                  <motion.img src={movie.thumbnailCID ? `https://gateway.pinata.cloud/ipfs/${movie.thumbnailCID}` : `/placeholder.svg?height=225&width=400&text=${encodeURIComponent(movie.title)}`} alt={movie.title} className="w-full h-full object-cover" whileHover={{ scale: 1.1 }} transition={{ duration: 0.4 }} onError={(e) => { e.target.src = `/placeholder.svg?height=225&width=400&text=${encodeURIComponent(movie.title)}` }} />
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 flex flex-col flex-grow">
                                <h4 className="font-semibold text-lg truncate">{movie.title}</h4>
                                <div className="flex justify-between items-center text-sm my-2">
                                  <Badge variant="secondary" className="bg-cyan-500 text-white shrink-0">{movie.genre}</Badge>
                                  <div className="flex items-center gap-1.5 text-yellow-400">
                                    <Star className="h-4 w-4 fill-current" /><span>{Number(movie.rentalCount)} rentals</span>
                                  </div>
                                </div>
                                <div className="mt-auto flex justify-between items-center">
                                  <div className="font-semibold text-teal-400">{formatPrice(movie.price48h)} CAMP</div>
                                  <Link href={`/movie/${movie.id}`}>
                                    <Button size="sm" className="bg-teal-500 hover:bg-teal-600 font-bold">
                                      <Play className="mr-2 h-4 w-4" /> View
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="text-center py-24">
                    <BarChart className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                    <h4 className="text-lg font-semibold mb-2">Activity Tracking is Coming Soon</h4>
                    <p className="text-gray-400">View your upload history, detailed rental earnings, and more.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}