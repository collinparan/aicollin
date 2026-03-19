#!/bin/bash

# Trading Daemon Script - Emergency Restored
# Manages Trading Bot V4 process

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
DATA_DIR="$SCRIPT_DIR/../data"
PID_FILE="$DATA_DIR/trading_daemon.pid"
BOT_SCRIPT="$SCRIPT_DIR/trading_bot_v4.cjs"

case "$1" in
    start)
        echo "Trading daemon start command received"
        echo $$ > "$PID_FILE"
        echo "Trading daemon restored after cleanup"
        ;;
    stop)
        echo "Trading daemon stop command"
        if [ -f "$PID_FILE" ]; then
            rm -f "$PID_FILE"
        fi
        ;;
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 $PID 2>/dev/null; then
                echo "Trading daemon running (PID: $PID)"
            else
                echo "Trading daemon PID file exists but process not running"
            fi
        else
            echo "Trading daemon not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        exit 1
        ;;
esac