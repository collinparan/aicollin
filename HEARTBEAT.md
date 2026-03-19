# HEARTBEAT.md

## Critical Monitoring Tasks

### Trading Bot Status (PRIORITY 1)
- Check `trading/logs/position_monitor.log` tail for "Trading bot not running" alerts
- If bot offline >30min, ALERT Collin immediately
- Bot restart: `cd trading/scripts && node trading_bot_v4.cjs &`

### Portfolio Health  
- Check portfolio value trends in monitor log
- Alert if >10% portfolio drop
- Monitor for unusual trading patterns

**Check every ~2-3 heartbeats, not every single one to avoid spam.**
