require("dotenv").config();
const fetch = require("node-fetch"); // Use 'import fetch from "node-fetch"' for ES modules

// Get configuration from environment variables
const apiKey = process.env.ALCHEMY_API_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const chain = process.env.CHAIN || "eth-sepolia"; // Default to Sepolia if not specified

// Build the URL dynamically based on the chain
const url = `https://${chain}.g.alchemy.com/v2/${apiKey}`;

console.log(`Tracking contract: ${contractAddress} on ${chain}`);

// Modified payload to focus specifically on your contract interactions
const payload = {
  jsonrpc: "2.0",
  id: 1,
  method: "alchemy_getAssetTransfers",
  params: [
    {
      fromBlock: "0x0",
      toBlock: "latest",
      // For a contract like yours, we want to see "TO" transfers - these are function calls
      toAddress: contractAddress,
      // For non-NFT contracts like Counter, external is the right category
      category: ["external"],
      order: "desc", // Get most recent first
      withMetadata: true,
      excludeZeroValue: false, // Include zero value transfers as function calls often have 0 ETH
      maxCount: "0x3e8", // Increase to 1000 results to catch more users
    },
  ],
};

async function getUniqueInteractors(pageKey = null, allTransfers = []) {
  try {
    // If pageKey is provided, add it to the params
    if (pageKey) {
      payload.params[0].pageKey = pageKey;
    }

    console.log("Fetching transactions...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Add new transfers to our collection
    if (
      data.result &&
      data.result.transfers &&
      data.result.transfers.length > 0
    ) {
      allTransfers = [...allTransfers, ...data.result.transfers];

      // If there are more pages and we want to fetch them all
      if (data.result.pageKey) {
        console.log(
          `Found more results, fetching next page with key: ${data.result.pageKey}`
        );
        // Uncomment the next line to fetch all pages automatically
        // return getUniqueInteractors(data.result.pageKey, allTransfers);
      }
    }

    // Extract unique addresses that have interacted with the contract
    const uniqueAddresses = new Map();

    allTransfers.forEach((transfer) => {
      if (transfer.from) {
        // Add to map with the first transaction timestamp as the value
        if (!uniqueAddresses.has(transfer.from)) {
          uniqueAddresses.set(transfer.from, {
            firstSeen: transfer.metadata.blockTimestamp,
            transactionCount: 1,
            lastTxHash: transfer.hash,
          });
        } else {
          // Update transaction count
          const current = uniqueAddresses.get(transfer.from);
          uniqueAddresses.set(transfer.from, {
            ...current,
            transactionCount: current.transactionCount + 1,
          });
        }
      }
    });

    // Display results
    if (uniqueAddresses.size > 0) {
      console.log(
        `\nFound ${uniqueAddresses.size} unique addresses that interacted with your contract:`
      );
      console.log("\n------------------------");

      // Convert map to array and sort by transaction count (most active first)
      const addressArray = Array.from(uniqueAddresses.entries());
      addressArray.sort(
        (a, b) => b[1].transactionCount - a[1].transactionCount
      );

      addressArray.forEach(([address, data], index) => {
        console.log(`\n${index + 1}. Address: ${address}`);
        console.log(`   First interaction: ${data.firstSeen}`);
        console.log(`   Number of interactions: ${data.transactionCount}`);
        console.log(`   Example transaction: ${data.lastTxHash}`);
      });

      console.log("\n------------------------");
    } else {
      console.log("\nNo addresses have interacted with your contract yet.");
    }

    console.log(`\nTotal transactions analyzed: ${allTransfers.length}`);

    return {
      uniqueAddresses: Array.from(uniqueAddresses.keys()),
      totalTransactions: allTransfers.length,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

getUniqueInteractors();
