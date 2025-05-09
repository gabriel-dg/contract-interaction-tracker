# Alchemy API - Track Contract Interactions

This repository demonstrates how to use Alchemy's API to fetch and analyze all addresses that have interacted with a specific smart contract on the blockchain.

> **Note:** This example demonstrates the direct REST API approach for educational purposes. For production applications, the [Alchemy SDK](https://docs.alchemy.com/reference/alchemy-sdk-quickstart) is generally recommended as it provides better type safety, error handling, and convenience methods.

## Overview

Smart contracts on blockchains like Ethereum record all interactions as transactions. Using Alchemy's powerful APIs, you can efficiently query these interactions to:

- Identify all unique addresses that called a specific contract
- Track token transfers to/from a contract
- Monitor contract interactions over time
- Build analytics on contract usage patterns

## Prerequisites

- Alchemy API key (sign up at [alchemy.com](https://www.alchemy.com/))
- Basic understanding of blockchain and smart contracts

## Setup

1. Clone this repository
2. Create a `.env` file in the root directory (copy from `.env.example`)
3. Add your Alchemy API key and target contract address:

```
ALCHEMY_API_KEY=your_api_key_here
NETWORK=eth-mainnet
CONTRACT_ADDRESS=0xYourContractAddressHere
```

## Key Concepts

### Getting Contract Interactions

To retrieve unique addresses that have interacted with a contract, use the `alchemy_getAssetTransfers` endpoint with these parameters:

- `fromBlock` & `toBlock`: Specify the block range to search (e.g., "0x0" to "latest")
- `toAddress`: The contract address you want to analyze
- `category`: Transaction types to include (e.g., ["external", "erc20", "erc721", "erc1155"])
- `maxCount`: Maximum number of results per request
- `pageKey`: For pagination through large result sets

### Capturing All Interactions

For a complete picture of contract interactions:

1. Query transactions where the contract is the recipient (`toAddress`)
2. Query transactions where the contract is the sender (`fromAddress`)
3. Process all results to extract and deduplicate addresses

## Implementation Strategy

1. Set up pagination to handle large result sets
2. Track unique addresses in a Set data structure
3. Process both incoming and outgoing transfers
4. Error handling for API responses

## Security Note

- Never commit your `.env` file with real API keys to public repositories
- The `.env.example` file is provided as a template
- Consider using environment variables in production environments

## Resources

- [Alchemy API Documentation](https://docs.alchemy.com/reference/api-overview)
- [Alchemy getAssetTransfers API](https://docs.alchemy.com/reference/alchemy-getassettransfers)

## License

MIT 