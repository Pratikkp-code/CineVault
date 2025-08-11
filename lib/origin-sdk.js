// Origin SDK integration for Camp blockchain
const ORIGIN_API_BASE = "https://api.origin.camp"
const CAMP_CHAIN_ID = 123420001114

export class OriginSDK {
  constructor() {
    this.apiBase = ORIGIN_API_BASE
    this.chainId = CAMP_CHAIN_ID
  }

  // Register file on Origin/Camp blockchain
  async registerFile(file, metadata = {}) {
    try {
      console.log("Registering file with Origin SDK:", file.name)

      const formData = new FormData()
      formData.append("file", file)
      formData.append(
        "metadata",
        JSON.stringify({
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          chainId: this.chainId,
          ...metadata,
        }),
      )

      const response = await fetch(`${this.apiBase}/files/register`, {
        method: "POST",
        body: formData,
        headers: {
          "X-Chain-ID": this.chainId.toString(),
        },
      })

      if (!response.ok) {
        // Fallback to Pinata if Origin API fails
        console.log("Origin API failed, falling back to Pinata")
        return await this.fallbackToPinata(file)
      }

      const result = await response.json()
      console.log("Origin SDK registration successful:", result)

      return {
        cid: result.cid || result.hash,
        url: result.url || `${this.apiBase}/files/${result.cid}`,
        gateway: result.gateway || `https://gateway.origin.camp/ipfs/${result.cid}`,
      }
    } catch (error) {
      console.error("Origin SDK registration failed:", error)
      // Fallback to Pinata
      return await this.fallbackToPinata(file)
    }
  }

  // Fallback to Pinata if Origin SDK fails
  async fallbackToPinata(file) {
    const { uploadToPinata } = await import("./pinata")
    const cid = await uploadToPinata(file)
    return {
      cid,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`,
      gateway: `https://gateway.pinata.cloud/ipfs/${cid}`,
    }
  }

  // Get file from Origin/Camp network
  getFileUrl(cid) {
    return `https://gateway.origin.camp/ipfs/${cid}`
  }

  // Verify file exists on network
  async verifyFile(cid) {
    try {
      const response = await fetch(`${this.apiBase}/files/${cid}/verify`, {
        headers: {
          "X-Chain-ID": this.chainId.toString(),
        },
      })
      return response.ok
    } catch (error) {
      console.error("File verification failed:", error)
      return false
    }
  }
}

// Create singleton instance
export const originSDK = new OriginSDK()

// Helper functions for easy use
export async function registerFileOnCamp(file, metadata = {}) {
  return await originSDK.registerFile(file, metadata)
}

export function getCampFileUrl(cid) {
  return originSDK.getFileUrl(cid)
}

export async function verifyFileOnCamp(cid) {
  return await originSDK.verifyFile(cid)
}
