/**
 * SwapWidgetV2 Example Usage
 *
 * This file demonstrates how to use the new SwapWidgetV2 component
 * with shadcn/ui components in your application.
 */

import React from 'react';
import SwapWidgetV2 from './SwapWidgetV2';
import { ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

/**
 * Example 1: Basic Usage
 * Simply import and use the SwapWidgetV2 component
 */
export function BasicSwapExample() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Token Swap
          </h1>
          <p className="text-muted-foreground">
            Connect your wallet and swap between AVAX and UVD tokens
          </p>
          <ConnectButton client={client} />
        </div>

        <SwapWidgetV2 />
      </div>
    </div>
  );
}

/**
 * Example 2: Side-by-Side Comparison
 * Show both old and new versions for comparison
 */
export function ComparisonExample() {
  const SwapWidget = require('./SwapWidget').default;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            SwapWidget Comparison
          </h1>
          <ConnectButton client={client} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Original</h2>
            <SwapWidget />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">V2 (shadcn/ui)</h2>
            <SwapWidgetV2 />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Embedded in a Page Section
 * Use the widget as part of a larger page layout
 */
export function EmbeddedSwapExample() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-8 text-center bg-gradient-to-b from-ultraviolet/10 to-transparent">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          UltraVioleta DAO
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Decentralized token swapping on Avalanche
        </p>
        <ConnectButton client={client} />
      </section>

      {/* Swap Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Info Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Swap Tokens Instantly
            </h2>
            <p className="text-muted-foreground">
              Exchange AVAX for UVD tokens or vice versa directly from your wallet.
              Powered by Arena DEX on the Avalanche network.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-ultraviolet">✓</span>
                <span>Direct wallet-to-wallet swaps</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ultraviolet">✓</span>
                <span>Customizable slippage tolerance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ultraviolet">✓</span>
                <span>Real-time price updates every 5 seconds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ultraviolet">✓</span>
                <span>Secure smart contract interactions</span>
              </li>
            </ul>
          </div>

          {/* Swap Widget Column */}
          <div>
            <SwapWidgetV2 />
          </div>
        </div>
      </section>
    </div>
  );
}

export default BasicSwapExample;
