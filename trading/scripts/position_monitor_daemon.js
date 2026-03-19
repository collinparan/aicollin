#!/usr/bin/env node

// Position Monitor Daemon - Rebuilt for Stability
// Runs continuously with proper error handling and restart mechanisms

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const LOG_FILE = path.join(SCRIPT_DIR, '../logs/position_monitor_daemon.log');
const PID_FILE = path.join(SCRIPT_DIR, '../data/position_monitor.pid');
const MONITOR_SCRIPT = path.join(SCRIPT_DIR, 'position_monitor_fixed.js');

// Monitoring interval (5 minutes)
const MONITOR_INTERVAL = 5 * 60 * 1000;

let running = true;
let cycleCount = 0;

function logMessage(message) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logLine = `[${timestamp}] DAEMON: ${message}\n`;
    
    try {
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (error) {
        console.error('Failed to write to daemon log:', error.message);
    }
    
    console.log(`[${timestamp}] DAEMON: ${message}`);
}

function writePidFile() {
    try {
        fs.writeFileSync(PID_FILE, process.pid.toString());
        logMessage(`Daemon started with PID ${process.pid}`);
    } catch (error) {
        logMessage(`Failed to write PID file: ${error.message}`);
    }
}

function removePidFile() {
    try {
        if (fs.existsSync(PID_FILE)) {
            fs.unlinkSync(PID_FILE);
        }
    } catch (error) {
        logMessage(`Failed to remove PID file: ${error.message}`);
    }
}

function runMonitorCycle() {
    return new Promise((resolve) => {
        cycleCount++;
        logMessage(`Starting monitor cycle #${cycleCount}`);
        
        const child = spawn('node', [MONITOR_SCRIPT], {
            cwd: SCRIPT_DIR,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                logMessage(`Monitor cycle #${cycleCount} completed successfully`);
                if (output.trim()) {
                    // Log the output from the monitor script
                    fs.appendFileSync(LOG_FILE.replace('_daemon.log', '.log'), output);
                }
            } else {
                logMessage(`Monitor cycle #${cycleCount} failed with code ${code}`);
                if (errorOutput.trim()) {
                    logMessage(`Error output: ${errorOutput.trim()}`);
                }
            }
            resolve();
        });
        
        // Timeout after 60 seconds
        setTimeout(() => {
            if (!child.killed) {
                logMessage(`Monitor cycle #${cycleCount} timeout - killing process`);
                child.kill('SIGTERM');
            }
        }, 60000);
    });
}

async function daemonLoop() {
    logMessage('Position monitor daemon starting...');
    writePidFile();
    
    while (running) {
        try {
            await runMonitorCycle();
            
            if (running) {
                logMessage(`Waiting ${MONITOR_INTERVAL / 1000} seconds until next cycle`);
                await new Promise(resolve => setTimeout(resolve, MONITOR_INTERVAL));
            }
        } catch (error) {
            logMessage(`Error in daemon loop: ${error.message}`);
            if (running) {
                logMessage('Waiting 30 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
    }
    
    logMessage('Daemon loop ended');
}

function handleShutdown(signal) {
    logMessage(`Received ${signal}, shutting down gracefully...`);
    running = false;
    removePidFile();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}

// Handle shutdown signals
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logMessage(`Uncaught exception: ${error.message}`);
    logMessage(error.stack);
    running = false;
    removePidFile();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logMessage(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    running = false;
    removePidFile();
    process.exit(1);
});

// Start the daemon
if (require.main === module) {
    daemonLoop().catch((error) => {
        logMessage(`Daemon failed to start: ${error.message}`);
        removePidFile();
        process.exit(1);
    });
}

module.exports = { daemonLoop };