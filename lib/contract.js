export const CONTRACT_ADDRESS ="0x78cA99EaE5E66806454EfbeD6f3accd4B5dA39f2"
export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_uploadFee", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "username", "type": "string"}
    ],
    "name": "UserProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "username", "type": "string"}
    ],
    "name": "UserProfileUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "movieId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "title", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "price48h", "type": "uint256"}
    ],
    "name": "MovieUploaded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "movieId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "MovieRented",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "username", "type": "string"},
      {"internalType": "string", "name": "logoCID", "type": "string"}
    ],
    "name": "createUserProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "username", "type": "string"},
      {"internalType": "string", "name": "logoCID", "type": "string"}
    ],
    "name": "updateUserProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "genre", "type": "string"},
      {"internalType": "string", "name": "language", "type": "string"},
      {"internalType": "string", "name": "filmCID", "type": "string"},
      {"internalType": "string", "name": "trailerCID", "type": "string"},
      {"internalType": "string", "name": "thumbnailCID", "type": "string"},
      {"internalType": "uint256", "name": "price48h", "type": "uint256"}
    ],
    "name": "uploadMovie",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "movieId", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "rentMovie",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllMovies",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "genre", "type": "string"},
          {"internalType": "string", "name": "language", "type": "string"},
          {"internalType": "string", "name": "filmCID", "type": "string"},
          {"internalType": "string", "name": "trailerCID", "type": "string"},
          {"internalType": "string", "name": "thumbnailCID", "type": "string"},
          {"internalType": "uint256", "name": "price48h", "type": "uint256"},
          {"internalType": "uint256", "name": "rentalCount", "type": "uint256"},
          {"internalType": "bool", "name": "listed", "type": "bool"}
        ],
        "internalType": "struct MovieRentalPlatform.Movie[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}],
    "name": "getMovie",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "genre", "type": "string"},
          {"internalType": "string", "name": "language", "type": "string"},
          {"internalType": "string", "name": "filmCID", "type": "string"},
          {"internalType": "string", "name": "trailerCID", "type": "string"},
          {"internalType": "string", "name": "thumbnailCID", "type": "string"},
          {"internalType": "uint256", "name": "price48h", "type": "uint256"},
          {"internalType": "uint256", "name": "rentalCount", "type": "uint256"},
          {"internalType": "bool", "name": "listed", "type": "bool"}
        ],
        "internalType": "struct MovieRentalPlatform.Movie",
        "name": "movieData",
        "type": "tuple"
      },
      {"internalType": "uint256", "name": "price48h", "type": "uint256"},
      {"internalType": "uint256", "name": "price72h", "type": "uint256"},
      {"internalType": "uint256", "name": "price1w", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "movieId", "type": "uint256"}
    ],
    "name": "hasActiveRental",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalMovies", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRemixes", "type": "uint256"},
      {"internalType": "uint256", "name": "currentUploadFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserProfile",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "username", "type": "string"},
          {"internalType": "string", "name": "logoCID", "type": "string"},
          {"internalType": "bool", "name": "exists", "type": "bool"}
        ],
        "internalType": "struct MovieRentalPlatform.UserProfile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "getMoviesByOwner",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getWatchHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "movieId", "type": "uint256"},
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "uint256", "name": "rentedAt", "type": "uint256"},
          {"internalType": "uint256", "name": "duration", "type": "uint256"}
        ],
        "internalType": "struct MovieRentalPlatform.Rental[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getActiveRentals",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "movieId", "type": "uint256"},
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "uint256", "name": "rentedAt", "type": "uint256"},
          {"internalType": "uint256", "name": "duration", "type": "uint256"}
        ],
        "internalType": "struct MovieRentalPlatform.Rental[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// Helper function to handle contract errors
export function handleContractError(error) {
  console.error('Contract error:', error)
  
  if (error.message.includes('User denied transaction')) {
    return 'Transaction was cancelled by user'
  }
  
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction'
  }
  
  if (error.message.includes('Profile already exists')) {
    return 'User profile already exists'
  }
  
  if (error.message.includes('Must create profile first')) {
    return 'Please create a user profile first'
  }
  
  if (error.message.includes('Incorrect upload fee')) {
    return 'Incorrect upload fee amount'
  }
  
  return error.message || 'Transaction failed'
}
