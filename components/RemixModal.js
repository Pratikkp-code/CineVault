'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { registerFileOnCamp } from '@/lib/origin-sdk' // Using your provided SDK file
import { CONTRACT_ADDRESS, CONTRACT_ABI, handleContractError } from '@/lib/contract'
import { UploadCloud, Loader2, X, Image as ImageIcon } from 'lucide-react'

export function RemixModal({ isOpen, onClose, movie }) {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [remixFile, setRemixFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Remix Uploaded!',
        description: 'Your remix has been successfully submitted to the blockchain.',
      })
      resetAndClose()
    }
  }, [isSuccess])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setRemixFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const resetAndClose = () => {
    setRemixFile(null)
    setPreviewUrl('')
    setIsUploading(false)
    onClose()
  }

  const handleRemixSubmit = async () => {
    if (!remixFile || !movie) return
    if (!isConnected) {
      toast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' })
      return
    }

    setIsUploading(true)
    toast({ title: 'Uploading Remix...', description: 'Your file is being uploaded to IPFS. Please wait.' })

    try {
      // 1. Upload file to IPFS via Origin SDK (with Pinata fallback)
      const uploadResult = await registerFileOnCamp(remixFile, {
        remixForMovieId: movie.id.toString(),
        parentCID: movie.filmCID,
      })

      if (!uploadResult?.cid) {
        throw new Error('Failed to get CID from upload.')
      }

      toast({ title: 'Upload Complete!', description: `CID: ${uploadResult.cid}. Now submitting to the blockchain.` })

      // 2. Call the smart contract function
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'uploadRemix',
        args: [movie.filmCID, uploadResult.cid], // parentCID, remixCID
      })
    } catch (error) {
      const errorMessage = handleContractError(error)
      toast({ title: 'Remix Failed', description: errorMessage, variant: 'destructive' })
      setIsUploading(false)
    }
  }

  const isLoading = isUploading || isSubmitting || isConfirming

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a Remix for "{movie?.title}"</DialogTitle>
          <DialogDescription>
            Upload a meme or image related to this movie. This is a free social feature.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="remix-file" className="text-lg font-semibold mb-3 block">Upload Image/Meme</Label>
          {previewUrl ? (
            <div className="relative group">
              <img src={previewUrl} alt="Remix preview" className="w-full h-auto max-h-64 object-contain rounded-lg bg-gray-900" />
              <button
                onClick={() => { setRemixFile(null); setPreviewUrl(''); }}
                className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-full p-8 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center hover:border-cyan-400 transition-colors">
              <ImageIcon className="h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-400 mb-2">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <Input
                id="remix-file"
                type="file"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleRemixSubmit}
            disabled={!remixFile || isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 font-bold"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isUploading ? 'Uploading...' : 'Submitting...'}</>
            ) : (
              <><UploadCloud className="mr-2 h-4 w-4" /> Upload Remix</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
