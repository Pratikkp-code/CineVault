import { originSDK } from "./origin-sdk"

const PINATA_API_KEY = "97695b675422248dd0ca"
const PINATA_SECRET_API_KEY = "da43572fa422bf95f18de1791d02b032c1e708ee1b35e209bc4b62d10b04a883"
const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlOTY5ZjdjZS0yNTNiLTQ0OGEtODM3Zi1hYmIwOTQxMWJlMTciLCJlbWFpbCI6InByYXRpa2thcHVyZTIwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NzY5NWI2NzU0MjIyNDhkZDBjYSIsInNjb3BlZEtleVNlY3JldCI6ImRhNDM1NzJmYTQyMmJmOTVmMThkZTE3OTFkMDJiMDMyYzFlNzA4ZWUxYjM1ZTIwOWJjNGI2MmQxMGIwNGE4ODMiLCJleHAiOjE3ODYxODU1MDF9.GhV7fe_OqmxFBUWdaTRIaX-p6KNZZeH6xYMtG-B0h3c"

// Enhanced upload function that tries Origin SDK first, then Pinata
export async function uploadFileToIPFS(file, options = {}) {
  const { useOriginFirst = true, metadata = {} } = options

  console.log("Starting file upload:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    useOriginFirst,
  })

  try {
    if (useOriginFirst) {
      console.log("Attempting upload via Origin SDK...")
      const result = await originSDK.registerFile(file, metadata)
      console.log("Origin SDK upload successful:", result)
      return result.cid
    }
  } catch (error) {
    console.log("Origin SDK failed, trying Pinata...", error.message)
  }

  // Fallback to Pinata
  return await uploadToPinata(file)
}

// Original Pinata upload function (enhanced)
export async function uploadToPinata(file) {
  try {
    console.log("Uploading to Pinata:", file.name)

    // Test authentication first
    await testPinataConnection()

    const formData = new FormData()
    formData.append("file", file)

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size.toString(),
        source: "decentralized-cinema",
      },
    })
    formData.append("pinataMetadata", metadata)

    const options = JSON.stringify({
      cidVersion: 1,
    })
    formData.append("pinataOptions", options)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Pinata upload successful:", result)

    if (!result.IpfsHash) {
      throw new Error("No IPFS hash returned from Pinata")
    }

    return result.IpfsHash
  } catch (error) {
    console.error("Pinata upload error:", error)
    throw new Error(`Failed to upload to Pinata: ${error.message}`)
  }
}

// Test Pinata connection
export async function testPinataConnection() {
  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("Pinata authentication successful:", result)
    return result
  } catch (error) {
    console.error("Pinata authentication failed:", error)
    throw error
  }
}

// Upload JSON metadata
export async function uploadJSONToPinata(jsonData, name) {
  try {
    console.log("Uploading JSON to Pinata:", name)

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: name,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            type: "json",
            source: "decentralized-cinema",
          },
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`JSON upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("JSON upload successful:", result)
    return result.IpfsHash
  } catch (error) {
    console.error("JSON upload error:", error)
    throw new Error(`Failed to upload JSON: ${error.message}`)
  }
}

// Get IPFS URL with multiple gateways
export function getIPFSUrl(cid, preferredGateway = "pinata") {
  const gateways = {
    pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
    origin: `https://gateway.origin.camp/ipfs/${cid}`,
    ipfs: `https://ipfs.io/ipfs/${cid}`,
    cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}`,
  }

  return gateways[preferredGateway] || gateways.pinata
}

// Validate file before upload
export function validateFile(file, maxSizeMB = 500, allowedTypes = []) {
  if (!file) {
    throw new Error("No file provided")
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`)
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(", ")}`)
  }

  return true
}
