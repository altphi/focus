# deno script to set slack status, presence, and do-not-disturb 

## requirements
deno

## setup
1. In Slack, create and install a custom application with these permissions: dnd:write, users.profile:write, users:write, dnd:read, users:read, users.profile:read
2. Go to the Slack app page.  Copy your User OAuth Token (it will start with xoxp-) and put it in `.focus_env` at root of focus repo.

## usage
#### set status, icon, dnd and away status for 30 minutes
```
deno run --allow-net status.ts \
  --text "Deep work - back soon" \
  --emoji ":no_bell:" \
  --minutes 30 \
  --away
```

#### clear everything
deno run --allow-net status.ts --clear