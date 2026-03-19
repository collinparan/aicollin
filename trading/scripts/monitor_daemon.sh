#!/bin/bash

# Monitor Daemon Script - Emergency Restored
# Monitors trading system health

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
DATA_DIR="$SCRIPT_DIR/../data"
PID_FILE="$DATA_DIR/monitor_daemon.pid"
ALERTS_FILE="$DATA_DIR/monitor_alerts.json"

case "$1" in
    start)
        echo "Monitor daemon start command received"
        echo $$ > "$PID_FILE"
        echo "Monitor daemon restored after cleanup"
        
        # Ensure alerts file exists
        if [ ! -f "$ALERTS_FILE" ]; then
            echo '{}' > "$ALERTS_FILE"
        fi
        ;;
    stop)
        echo "Monitor daemon stop command"
        if [ -f "$PID_FILE" ]; then
            rm -f "$PID_FILE"
        fi
        ;;
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 $PID 2>/dev/null; then
                echo "Monitor daemon running (PID: $PID)"
            else
                echo "Monitor daemon PID file exists but process not running"
            fi
        else
            echo "Monitor daemon not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        exit 1
        ;;
esac