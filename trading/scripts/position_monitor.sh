#!/bin/bash

# Position Monitor Control Script - Rebuilt for Stability
# Controls the robust Node.js daemon process

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
DAEMON_SCRIPT="$SCRIPT_DIR/position_monitor_daemon.js"
MONITOR_SCRIPT="$SCRIPT_DIR/position_monitor_fixed.js"
PID_FILE="$SCRIPT_DIR/../data/position_monitor.pid"
LOG_FILE="$SCRIPT_DIR/../logs/position_monitor_daemon.log"

check_daemon_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            return 0  # Running
        else
            rm -f "$PID_FILE"
            return 1  # Not running
        fi
    else
        return 1  # Not running
    fi
}

start_daemon() {
    if check_daemon_status; then
        echo "Position monitor daemon is already running (PID: $(cat $PID_FILE))"
        return 1
    fi
    
    echo "Starting position monitor daemon..."
    nohup node "$DAEMON_SCRIPT" > /dev/null 2>&1 &
    
    # Wait a moment and check if it started successfully
    sleep 2
    if check_daemon_status; then
        echo "Position monitor daemon started successfully (PID: $(cat $PID_FILE))"
        return 0
    else
        echo "Failed to start position monitor daemon"
        return 1
    fi
}

stop_daemon() {
    if ! check_daemon_status; then
        echo "Position monitor daemon is not running"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    echo "Stopping position monitor daemon (PID: $PID)..."
    
    # Send TERM signal first
    kill -TERM $PID 2>/dev/null
    
    # Wait for graceful shutdown
    for i in {1..10}; do
        if ! kill -0 $PID 2>/dev/null; then
            break
        fi
        sleep 1
    done
    
    # Force kill if still running
    if kill -0 $PID 2>/dev/null; then
        echo "Daemon didn't stop gracefully, force killing..."
        kill -KILL $PID 2>/dev/null
    fi
    
    rm -f "$PID_FILE"
    echo "Position monitor daemon stopped"
    return 0
}

restart_daemon() {
    stop_daemon
    sleep 1
    start_daemon
}

show_status() {
    if check_daemon_status; then
        PID=$(cat "$PID_FILE")
        echo "Position monitor daemon is running (PID: $PID)"
        
        # Show last few log entries
        if [ -f "$LOG_FILE" ]; then
            echo ""
            echo "Recent daemon activity:"
            tail -5 "$LOG_FILE"
        fi
        
        return 0
    else
        echo "Position monitor daemon is not running"
        return 1
    fi
}

run_single_check() {
    echo "Running single position check..."
    node "$MONITOR_SCRIPT"
}

case "$1" in
    start|--daemon)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        restart_daemon
        ;;
    status)
        show_status
        ;;
    check)
        run_single_check
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|check}"
        echo ""
        echo "  start    - Start the position monitor daemon"
        echo "  stop     - Stop the position monitor daemon"
        echo "  restart  - Restart the position monitor daemon"
        echo "  status   - Show daemon status and recent activity"
        echo "  check    - Run a single position check"
        exit 1
        ;;
esac