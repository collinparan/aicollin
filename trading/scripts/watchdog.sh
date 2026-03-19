#!/bin/bash

# Position Monitor Watchdog - Ensures daemon stays running
# Can be run via cron every few minutes to auto-restart if needed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
CONTROL_SCRIPT="$SCRIPT_DIR/position_monitor.sh"
LOG_FILE="$SCRIPT_DIR/../logs/watchdog.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WATCHDOG: $1" >> "$LOG_FILE"
}

# Check daemon status
if ! "$CONTROL_SCRIPT" status > /dev/null 2>&1; then
    log_message "Position monitor daemon is down, restarting..."
    if "$CONTROL_SCRIPT" start >> "$LOG_FILE" 2>&1; then
        log_message "Successfully restarted position monitor daemon"
    else
        log_message "Failed to restart position monitor daemon"
    fi
else
    log_message "Position monitor daemon is running normally"
fi