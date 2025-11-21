#!/usr/bin/env bash

# Check if any argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <minutes>"
    echo "Please provide the number of minutes as a numeric argument."
    exit 1
fi

# Check if argument is numeric
if ! [[ $1 =~ ^[0-9]+$ ]]; then
    echo "Error: '$1' is not a valid number."
    echo "Usage: $0 <minutes>"
    echo "Please provide the number of minutes as a numeric argument."
    exit 1
fi

if ! command -v figlet &> /dev/null; then
    echo "figlet is not installed. Install it with 'brew install figlet'."
    exit 1
fi

minutes=$1
time=$((minutes * 60))
while [ $time -gt 0 ]; do
    clear
    current_minutes=$((time / 60))
    current_seconds=$((time % 60))
    time_display=$(printf "%02d:%02d" $current_minutes $current_seconds)
    figlet "$time_display"
    sleep 1
    time=$((time - 1))
done
clear
figlet "Time's up!"

[[ "$OSTYPE" == darwin* ]] && osascript -e 'display notification "Time'\''s up" with title "Shell Timer"'
[[ "$OSTYPE" == linux* ]] && notify-send "Time's up!"
