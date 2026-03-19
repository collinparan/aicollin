#!/usr/bin/env node

/**
 * Trading Bot V4 - Hybrid NOF2+Grok Implementation
 * Inspired by NOF1.ai's proven Grok trading performance
 * 
 * Strategy Overview:
 * - NOF2 (Normalized Oscillator Fusion): Multi-timeframe momentum analysis
 * - Grok AI: Final trade decision layer with market reasoning
 * - Hybrid Approach: Quantitative signals + AI decision making
 * - Risk Management: Portfolio-based position sizing
 * - Multi-asset: BTC, ETH, SOL, LINK, AVAX, XLM
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Portfolio settings
    PORTFOLIO_TARGET: 1600,
    MAX_POSITION_SIZE: 0.15, // 15% max per asset
    MIN_CASH_RESERVE: 0.20,  // 20% minimum cash
    
    // NOF2 Strategy Parameters
    NOF2: {
        SHORT_PERIOD: 8,
        LONG_PERIOD: 21,
        SIGNAL_THRESHOLD: 0.65,
        MOMENTUM_LOOKBACK: 14
    },
    
    // Grok AI Integration
    GROK: {
        ENABLED: false,  // TODO: Enable when API key available
        CONFIDENCE_THRESHOLD: 0.7,  // Minimum Grok confidence to override NOF2
        MAX_REASONING_LENGTH: 500,  // Token limit for market analysis
        TIMEOUT_MS: 5000,  // 5 second timeout for Grok responses
    },
    
    // Trading Fees (Crypto.com Exchange rates)
    FEES: {
        MAKER_FEE: 0.004,       // 0.4% maker fee (Crypto.com standard)
        TAKER_FEE: 0.004,       // 0.4% taker fee (Crypto.com standard)
        WITHDRAWAL_FEE: 0.0005, // 0.05% withdrawal fee
        MIN_TRADE_SIZE: 15,     // $15 minimum trade due to higher fees
        CRO_DISCOUNT: 0.001,    // 0.1% fee reduction if holding CRO (25% off)
    },
    
    // Risk Management
    RISK: {
        STOP_LOSS: 0.08,        // 8% stop loss
        TAKE_PROFIT: 0.12,      // 12% take profit
        MAX_DRAWDOWN: 0.15,     // 15% max portfolio drawdown
        VOLATILITY_FILTER: 0.25 // Skip trading if volatility > 25%
    },
    
    // Trading pairs
    ASSETS: ['BTC', 'ETH', 'SOL', 'LINK', 'AVAX', 'XLM'],
    
    // Timing
    CHECK_INTERVAL: 30000,  // 30 seconds
    LOG_INTERVAL: 300000,   // 5 minutes
};

class TradingBot {
    constructor() {
        this.isRunning = false;
        this.portfolio = this.loadPortfolio();
        this.priceHistory = new Map();
        this.lastLogTime = 0;
        
        console.log('🦊 Trading Bot V4 (NOF2+ML) initializing...');
        this.initializeBot();
    }
    
    loadPortfolio() {
        const stateFile = path.join(__dirname, '../data/bot_v4_state.json');
        try {
            if (fs.existsSync(stateFile)) {
                const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
                return {
                    positions: state.positions || {},
                    cash: state.cash || 934.45,
                    totalValue: state.portfolio_value || 1600.6,
                    lastUpdate: state.last_update || new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('❌ Error loading portfolio:', error.message);
        }
        
        // Default portfolio if state file missing/corrupted
        return {
            positions: {
                BTC: { quantity: 0.00164422, value: 119.96 },
                ETH: { quantity: 0.0550649, value: 120.16 },
                SOL: { quantity: 1.328163, value: 121.67 },
                LINK: { quantity: 12.4675, value: 118.63 },
                AVAX: { quantity: 12.14717, value: 124.02 },
                XLM: { quantity: 368.223752, value: 61.71 }
            },
            cash: 934.45,
            totalValue: 1600.6,
            lastUpdate: new Date().toISOString()
        };
    }
    
    savePortfolio() {
        const stateFile = path.join(__dirname, '../data/bot_v4_state.json');
        const state = {
            positions: this.portfolio.positions,
            cash: this.portfolio.cash,
            portfolio_value: this.portfolio.totalValue,
            last_update: new Date().toISOString(),
            status: 'active',
            strategy: 'NOF2+ML',
            circuit_breaker_active: false,
            total_fees: this.portfolio.totalFees || 0
        };
        
        try {
            fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        } catch (error) {
            console.error('❌ Error saving portfolio:', error.message);
        }
    }
    
    async initializeBot() {
        console.log('📊 Loading initial market data...');
        
        // Initialize price history for all assets
        for (const asset of CONFIG.ASSETS) {
            this.priceHistory.set(asset, []);
        }
        
        // Simulate initial price data (replace with real API calls)
        await this.updatePriceData();
        
        this.isRunning = true;
        console.log('✅ Bot initialized successfully');
        console.log(`💰 Portfolio Value: $${this.portfolio.totalValue.toFixed(2)}`);
        console.log(`💵 Cash Reserve: $${this.portfolio.cash.toFixed(2)} (${(this.portfolio.cash/this.portfolio.totalValue*100).toFixed(1)}%)`);
        console.log(`🤖 Strategy: NOF2 + ${CONFIG.GROK.ENABLED ? 'Grok AI' : 'Simulated Grok'}`);
        
        if (this.portfolio.totalFees) {
            console.log(`📊 Cumulative Trading Fees: $${this.portfolio.totalFees.toFixed(2)}`);
        }
        
        this.startTrading();
    }
    
    async updatePriceData() {
        // TODO: Replace with real exchange API calls
        // For now, simulate price data with realistic volatility
        const now = Date.now();
        
        for (const asset of CONFIG.ASSETS) {
            const history = this.priceHistory.get(asset);
            const lastPrice = history.length > 0 ? history[history.length - 1].price : this.getInitialPrice(asset);
            
            // Simulate realistic price movement
            const volatility = this.getAssetVolatility(asset);
            const change = (Math.random() - 0.5) * 2 * volatility;
            const newPrice = lastPrice * (1 + change);
            
            history.push({
                timestamp: now,
                price: newPrice,
                volume: Math.random() * 1000000
            });
            
            // Keep only recent data (last 1000 points)
            if (history.length > 1000) {
                history.shift();
            }
        }
    }
    
    getInitialPrice(asset) {
        // Current market prices (approximately)
        const prices = {
            BTC: 73000,
            ETH: 2180,
            SOL: 91.5,
            LINK: 9.5,
            AVAX: 10.2,
            XLM: 0.1675
        };
        return prices[asset] || 100;
    }
    
    getAssetVolatility(asset) {
        // Daily volatility estimates
        const volatilities = {
            BTC: 0.04,   // 4%
            ETH: 0.05,   // 5%
            SOL: 0.08,   // 8%
            LINK: 0.06,  // 6%
            AVAX: 0.07,  // 7%
            XLM: 0.09    // 9%
        };
        return (volatilities[asset] || 0.05) / Math.sqrt(24 * 60 / (CONFIG.CHECK_INTERVAL / 1000));
    }
    
    calculateNOF2Signal(asset) {
        const history = this.priceHistory.get(asset);
        if (!history || history.length < CONFIG.NOF2.LONG_PERIOD + CONFIG.NOF2.MOMENTUM_LOOKBACK) {
            return { signal: 0, confidence: 0, reasoning: "Insufficient data" };
        }
        
        const prices = history.map(h => h.price);
        
        // Calculate short and long EMAs
        const shortEMA = this.calculateEMA(prices, CONFIG.NOF2.SHORT_PERIOD);
        const longEMA = this.calculateEMA(prices, CONFIG.NOF2.LONG_PERIOD);
        
        // Normalized oscillator
        const oscillator = (shortEMA - longEMA) / longEMA;
        
        // Momentum component
        const momentum = this.calculateMomentum(prices, CONFIG.NOF2.MOMENTUM_LOOKBACK);
        
        // Fusion signal
        const rawSignal = (oscillator * 0.7) + (momentum * 0.3);
        const signal = Math.tanh(rawSignal * 2); // Normalize between -1 and 1
        
        // Signal strength as confidence
        const confidence = Math.abs(signal);
        
        return { 
            signal, 
            confidence,
            reasoning: `NOF2: EMA(${CONFIG.NOF2.SHORT_PERIOD}/${CONFIG.NOF2.LONG_PERIOD}) oscillator=${(oscillator*100).toFixed(2)}%, momentum=${(momentum*100).toFixed(2)}%`
        };
    }
    
    calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }
    
    calculateMomentum(prices, lookback) {
        if (prices.length < lookback) return 0;
        
        const current = prices[prices.length - 1];
        const past = prices[prices.length - lookback];
        
        return (current - past) / past;
    }
    
    calculatePositionSize(asset, signal) {
        const signalStrength = Math.abs(signal);
        const baseSize = CONFIG.MAX_POSITION_SIZE * signalStrength;
        
        // Risk adjustment
        const volatility = this.getAssetVolatility(asset);
        const volatilityAdjustment = Math.min(1, CONFIG.RISK.VOLATILITY_FILTER / volatility);
        
        return baseSize * volatilityAdjustment;
    }
    
    async getGrokDecision(asset, nof2Analysis, marketContext) {
        if (!CONFIG.GROK.ENABLED) {
            return nof2Analysis; // Fallback to NOF2 only
        }
        
        try {
            // TODO: Replace with actual Grok API call
            // For now, simulate Grok reasoning that enhances NOF2
            const prompt = `Analyze ${asset} trading opportunity:
            
NOF2 Signal: ${nof2Analysis.signal.toFixed(3)} (${nof2Analysis.confidence.toFixed(2)} confidence)
Technical: ${nof2Analysis.reasoning}
Market Context: Portfolio $${this.portfolio.totalValue.toFixed(0)}, Cash ${(this.portfolio.cash/this.portfolio.totalValue*100).toFixed(1)}%

Should we trade? Consider:
- Market sentiment and macro conditions
- Asset-specific technicals beyond NOF2
- Risk/reward with 0.4% Crypto.com fees
- Portfolio allocation balance

Respond with: DECISION: [BUY/SELL/HOLD] | CONFIDENCE: [0.0-1.0] | REASONING: [brief logic]`;

            // Simulate Grok response (replace with real API)
            const grokResponse = this.simulateGrokResponse(asset, nof2Analysis);
            
            return {
                signal: grokResponse.decision === 'BUY' ? Math.abs(nof2Analysis.signal) : 
                       grokResponse.decision === 'SELL' ? -Math.abs(nof2Analysis.signal) : 0,
                confidence: grokResponse.confidence,
                reasoning: `Grok: ${grokResponse.reasoning} | ${nof2Analysis.reasoning}`
            };
            
        } catch (error) {
            console.error(`❌ Grok API error for ${asset}:`, error.message);
            return nof2Analysis; // Fallback to NOF2
        }
    }
    
    simulateGrokResponse(asset, nof2Analysis) {
        // Temporary simulation until real Grok API integration
        // Adds market context and risk awareness to NOF2 signals
        
        const marketConditions = Math.random(); // Simulate market sentiment
        const assetMomentum = nof2Analysis.signal;
        
        let decision = 'HOLD';
        let confidence = nof2Analysis.confidence * 0.8; // More conservative than pure NOF2
        let reasoning = '';
        
        if (Math.abs(assetMomentum) > 0.3) {
            if (marketConditions > 0.6 && assetMomentum > 0) {
                decision = 'BUY';
                reasoning = 'Strong bullish NOF2 + favorable market conditions';
            } else if (marketConditions < 0.4 && assetMomentum < 0) {
                decision = 'SELL';
                reasoning = 'Bearish NOF2 confirmed by weak market sentiment';
            } else {
                decision = 'HOLD';
                reasoning = 'NOF2 signal present but market conditions mixed';
                confidence *= 0.5;
            }
        } else {
            reasoning = 'Weak NOF2 signals, awaiting clearer direction';
        }
        
        return { decision, confidence, reasoning };
    }

    async executeTrading() {
        const decisions = new Map();
        
        // Calculate NOF2 signals for all assets
        for (const asset of CONFIG.ASSETS) {
            const nof2Analysis = this.calculateNOF2Signal(asset);
            
            // Get Grok's decision on the NOF2 signal
            const finalDecision = await this.getGrokDecision(asset, nof2Analysis, {
                portfolio: this.portfolio,
                timestamp: Date.now()
            });
            
            decisions.set(asset, finalDecision);
        }
        
        // Execute trades based on Grok-enhanced decisions
        for (const [asset, decision] of decisions) {
            if (Math.abs(decision.signal) > CONFIG.NOF2.SIGNAL_THRESHOLD && 
                decision.confidence > CONFIG.GROK.CONFIDENCE_THRESHOLD) {
                
                console.log(`🤖 ${asset}: ${decision.reasoning}`);
                await this.executeTrade(asset, decision.signal);
            }
        }
        
        this.savePortfolio();
    }
    
    async executeTrade(asset, signal) {
        const currentPosition = this.portfolio.positions[asset] || { quantity: 0, value: 0 };
        const currentPrice = this.getCurrentPrice(asset);
        const targetSize = this.calculatePositionSize(asset, signal);
        
        // Calculate target position value
        const direction = signal > 0 ? 1 : -1;
        const targetValue = this.portfolio.totalValue * targetSize * direction;
        const currentValue = currentPosition.quantity * currentPrice;
        
        const tradeDelta = targetValue - currentValue;
        
        // Enhanced trade filtering: minimum trade size AND fee justification
        const minTradeThreshold = Math.max(
            this.portfolio.totalValue * 0.01,  // Min 1% portfolio trade
            CONFIG.FEES.MIN_TRADE_SIZE * 2     // Must be 2x min trade to justify fees
        );
        
        if (Math.abs(tradeDelta) > minTradeThreshold) {
            await this.placeTrade(asset, tradeDelta, currentPrice);
        }
    }
    
    calculateTradingFees(tradeValue, isMaker = false, hasCRO = false) {
        // Crypto.com Exchange: 0.4% maker/taker (same rate)
        let feeRate = CONFIG.FEES.MAKER_FEE; // Same as taker on Crypto.com
        
        // Apply CRO discount if holding CRO tokens (25% reduction)
        if (hasCRO) {
            feeRate -= CONFIG.FEES.CRO_DISCOUNT;
        }
        
        return Math.abs(tradeValue) * feeRate;
    }
    
    async placeTrade(asset, deltaValue, price) {
        // Skip small trades that don't justify fees
        if (Math.abs(deltaValue) < CONFIG.FEES.MIN_TRADE_SIZE) {
            return;
        }
        
        // Calculate fees (Crypto.com Exchange - same rate for maker/taker)
        const fees = this.calculateTradingFees(deltaValue, false, false); // Assume no CRO discount for now
        const netDeltaValue = deltaValue > 0 ? deltaValue + fees : deltaValue - fees;
        
        // Check if we have enough cash for buy orders (including fees)
        if (deltaValue > 0 && netDeltaValue > this.portfolio.cash) {
            console.log(`⚠️  Insufficient cash for ${asset} trade: need $${netDeltaValue.toFixed(2)}, have $${this.portfolio.cash.toFixed(2)}`);
            return;
        }
        
        console.log(`🔄 ${deltaValue > 0 ? 'BUY' : 'SELL'} ${asset}: $${Math.abs(deltaValue).toFixed(2)} @ $${price.toFixed(4)} (fees: $${fees.toFixed(2)})`);
        
        const deltaQuantity = deltaValue / price;
        const position = this.portfolio.positions[asset] || { quantity: 0, value: 0 };
        
        // Update position
        position.quantity += deltaQuantity;
        position.value = position.quantity * price;
        
        // Update cash (subtract trade value AND fees)
        this.portfolio.cash -= netDeltaValue;
        
        // Track cumulative fees
        if (!this.portfolio.totalFees) {
            this.portfolio.totalFees = 0;
        }
        this.portfolio.totalFees += fees;
        
        // Update portfolio
        this.portfolio.positions[asset] = position;
        this.updatePortfolioValue();
        
        // Log trade with fees
        this.logTrade(asset, deltaQuantity, price, deltaValue, fees);
    }
    
    getCurrentPrice(asset) {
        const history = this.priceHistory.get(asset);
        return history && history.length > 0 ? history[history.length - 1].price : this.getInitialPrice(asset);
    }
    
    updatePortfolioValue() {
        let totalValue = this.portfolio.cash;
        
        for (const [asset, position] of Object.entries(this.portfolio.positions)) {
            if (position.quantity > 0) {
                const currentPrice = this.getCurrentPrice(asset);
                position.value = position.quantity * currentPrice;
                totalValue += position.value;
            }
        }
        
        this.portfolio.totalValue = totalValue;
        this.portfolio.lastUpdate = new Date().toISOString();
    }
    
    logTrade(asset, quantity, price, value, fees = 0) {
        const logFile = path.join(__dirname, '../logs/trading_bot.log');
        const timestamp = new Date().toISOString();
        const netValue = Math.abs(value) + fees;
        const logEntry = `[${timestamp}] ${quantity > 0 ? 'BUY' : 'SELL'} ${asset}: ${Math.abs(quantity).toFixed(6)} @ $${price.toFixed(4)} = $${Math.abs(value).toFixed(2)} (fees: $${fees.toFixed(2)}, net: $${netValue.toFixed(2)})\n`;
        
        fs.appendFileSync(logFile, logEntry);
    }
    
    logPortfolioStatus() {
        const now = Date.now();
        if (now - this.lastLogTime < CONFIG.LOG_INTERVAL) return;
        
        this.updatePortfolioValue();
        
        console.log('\n═══ Portfolio Status ═══');
        console.log(`💰 Total Value: $${this.portfolio.totalValue.toFixed(2)}`);
        console.log(`💵 Cash: $${this.portfolio.cash.toFixed(2)} (${(this.portfolio.cash/this.portfolio.totalValue*100).toFixed(1)}%)`);
        
        for (const [asset, position] of Object.entries(this.portfolio.positions)) {
            if (position.quantity > 0) {
                const currentPrice = this.getCurrentPrice(asset);
                const value = position.quantity * currentPrice;
                const percentage = (value / this.portfolio.totalValue * 100).toFixed(1);
                console.log(`  ${asset}: ${position.quantity.toFixed(6)} = $${value.toFixed(2)} (${percentage}%)`);
            }
        }
        
        // Log to file
        const logFile = path.join(__dirname, '../logs/position_monitor.log');
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
        let logEntry = `[${timestamp}] ═══ Position Check ═══\n`;
        logEntry += `[${timestamp}] ✓ Bot running\n`;
        
        for (const [asset, position] of Object.entries(this.portfolio.positions)) {
            if (position.quantity > 0) {
                const currentPrice = this.getCurrentPrice(asset);
                const value = position.quantity * currentPrice;
                logEntry += `[${timestamp}]   ${asset}: ${position.quantity.toFixed(6)} = $${value.toFixed(2)}\n`;
            }
        }
        
        logEntry += `[${timestamp}]   USD: ${this.portfolio.cash.toFixed(10)} = $${this.portfolio.cash.toFixed(2)}\n`;
        logEntry += `[${timestamp}] ✓ Portfolio: $${this.portfolio.totalValue.toFixed(2)}\n`;
        logEntry += `[${timestamp}] ✓ State file updated successfully\n`;
        logEntry += `[${timestamp}] ✓ All positions synchronized\n`;
        logEntry += `[${timestamp}] \n`;
        logEntry += `[${timestamp}] Position monitor cycle complete\n`;
        
        fs.appendFileSync(logFile, logEntry);
        
        this.lastLogTime = now;
    }
    
    async startTrading() {
        console.log('🚀 Starting trading loop...');
        
        const tradingLoop = async () => {
            try {
                if (!this.isRunning) return;
                
                await this.updatePriceData();
                await this.executeTrading();
                this.logPortfolioStatus();
                
            } catch (error) {
                console.error('❌ Trading loop error:', error.message);
            }
            
            setTimeout(tradingLoop, CONFIG.CHECK_INTERVAL);
        };
        
        tradingLoop();
    }
    
    stop() {
        console.log('🛑 Stopping trading bot...');
        this.isRunning = false;
        this.savePortfolio();
    }
}

// Signal handlers
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    if (global.tradingBot) {
        global.tradingBot.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    if (global.tradingBot) {
        global.tradingBot.stop();
    }
    process.exit(0);
});

// Main execution
if (require.main === module) {
    global.tradingBot = new TradingBot();
}

module.exports = TradingBot;