#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "$(readlink -f "${BASH_SOURCE[0]}")" )" && pwd )"
. "${SCRIPT_DIR}/.focus_env"

if [[ -z "$FOCUS_CALENDAR_NAME" ]]; then
    echo "Environment variable FOCUS_CALENDAR_NAME must be set."
    exit 1
fi

if [[ -z "$1" || -z "$2" ]]; then
    echo "Usage: focus.sh <minutes> <title>"
    exit 1
fi

minutes=$1
title=$2
start_time=$(date '+%I:%M %p')
start_timestamp=$(date +%s)

cleanup () {
    set +e
    echo -e "\nExiting..."
    gcalcli --calendar "${FOCUS_CALENDAR_NAME}" delete "Focusing on $title" --iamaexpert
    elapsed_mins=$(( ($(date +%s) - start_timestamp) / 60 ))
    gcalcli --calendar "${FOCUS_CALENDAR_NAME}" add --title "Focusing on $title" --when "${elapsed_mins} minutes ago" --end "now" --description="Focus time (interrupted)" --noprompt
    deno run --allow-env --allow-net "${SCRIPT_DIR}/slack-status/status.ts" --clear
    shortcuts run "Focus Off"
    trap - SIGINT
    exit 0
}

trap cleanup SIGINT
#set -e

deno run --allow-env --allow-net "${SCRIPT_DIR}/slack-status/status.ts" --text "Focus time" --emoji ":no_bell:" --minutes "${minutes}" --away

gcalcli --calendar "${FOCUS_CALENDAR_NAME}" add --title "Focusing on $title" --when "now" --duration "${minutes}" --description="Focus time" --noprompt

[[ $OSTYPE == darwin* ]] && shortcuts run "Focus On"
[[ $OSTYPE == linux* ]] && ./dnd-toggle.sh on

"${SCRIPT_DIR}/shell-timer/timer.sh" "${minutes}"

[[ $OSTYPE == darwin* ]] && shortcuts run "Focus Off"
[[ $OSTYPE == linux* ]] && ./dnd-toggle.sh off
deno run --allow-env --allow-net "${SCRIPT_DIR}/slack-status/status.ts" --clear
