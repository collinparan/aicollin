#!/usr/bin/env node

/**
 * API Key Activation Test Loop
 * Continuously tests Crypto.com API until key activates
 */

const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

let testCount = 0;
const startTime = Date.now();

function testAPI() {
    testCount++;
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log(`\n🧪 API Test #${testCount} (${elapsed}m elapsed)`);
    console.log('================================================');
    
    try {
        const config = JSON.parse(fs.readFileSync('../config/api_keys.json', 'utf8'));
        const { api_key, secret } = config.crypto_com;
        
        const timestamp = Date.now();
        const method = 'POST';
        const path = '/v2/private/get-account-summary';
        
        const requestObj = {
            id: 100 + testCount,
            method: 'private/get-account-summary',
            api_key: api_key,
            nonce: timestamp
        };
        
        const body = JSON.stringify(requestObj);
        const signString = method + path + '' + timestamp + api_key;
        const signature = crypto.createHmac('sha256', secret).update(signString).digest('hex');
        
        const options = {
            hostname: 'api.crypto.com',
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CRO-API-KEY': api_key,
                'X-CRO-API-SIGNATURE': signature,
                'X-CRO-API-TIMESTAMP': timestamp.toString()
            }
        };
        
        console.log(`⏰ ${new Date().toLocaleTimeString()} - Testing API...`);
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.code === 0) {
                        console.log('🎉 SUCCESS! API KEY ACTIVATED!');
                        console.log('✅ Real portfolio access restored!');
                        console.log('');
                        
                        if (response.result) {
                            console.log('💰 ACTUAL PORTFOLIO DATA:');
                            console.log('   Total Balance:', response.result.total_balance || 'N/A');
                            console.log('   Available:', response.result.total_available_balance || 'N/A');
                            console.log('   Currency:', response.result.currency || 'USD');
                            
                            if (response.result.accounts) {
                                console.log('');
                                console.log('📊 Asset Breakdown:');
                                response.result.accounts.forEach(account => {
                                    if (parseFloat(account.balance) > 0) {
                                        console.log(`   ${account.currency}: ${account.balance}`);
                                    }
                                });
                            }
                        }
                        
                        console.log('');
                        console.log('🚀 Ready to restart trading bot with real data!');
                        console.log('');
                        console.log('='.repeat(50));
                        console.log('✅ API ACTIVATION COMPLETE - MANUAL RESTART NEEDED');
                        console.log('='.repeat(50));
                        
                        process.exit(0);
                        
                    } else {
                        console.log(`❌ Still unauthorized (Code: ${response.code})`);
                        console.log(`   Message: ${response.message}`);
                        
                        if (response.code === 10002) {
                            console.log('⏳ Key still activating... will retry in 2 minutes');
                        }
                        
                        // Schedule next test
                        setTimeout(testAPI, 120000); // 2 minutes
                    }
                } catch (parseError) {
                    console.log('❌ Parse error:', parseError.message);
                    setTimeout(testAPI, 120000);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            setTimeout(testAPI, 120000);
        });
        
        req.setTimeout(15000, () => {
            console.log('❌ Timeout - will retry');
            req.abort();
            setTimeout(testAPI, 120000);
        });
        
        req.write(body);
        req.end();
        
    } catch (e) {
        console.log('❌ Setup error:', e.message);
        setTimeout(testAPI, 120000);
    }
}

console.log('🔄 CRYPTO.COM API ACTIVATION MONITOR');
console.log('===================================');
console.log('Target Portfolio Value: $1,575.54');
console.log('Testing every 2 minutes until activated...');
console.log('Press Ctrl+C to stop');

// Start testing immediately
testAPI();