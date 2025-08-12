'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

console.log(process.env)

// Camp Blockchain configuration
const campBlockchain = {
  id: 123420001114,
  name: 'Basecamp Testnet',
  nativeCurrency: { name: 'CAMP', symbol: 'CAMP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.basecamp.t.raas.gelato.cloud'] },
  },
  blockExplorers: {
    default: { name: 'Camp Explorer', url: 'https://basecamp.cloud.blockscout.com' },
  },
  testnet: true,
}

const config = getDefaultConfig({
  appName: 'CineVault',
  projectId: [process.env.NEXT_PUBLIC_WALLET_CONNECT], // Your WalletConnect project ID
  chains: [campBlockchain],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
