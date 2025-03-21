# focus mode scripts
Single command that sets slack status and notifications, adds calendar entry for time tracking, enables Focus mode for OSX.

## set up
1. Copy .focus_env.default to .focus_env (SLACK_USER_TOKEN variable setting will come from step 2).  Set your google calendar name (e.g. "youremail@gmail.com").
2. Set up the deno app according to slack-status/README.md.
3. Set up gcalcli according to [their project docs](https://github.com/insanum/gcalcli).
4. Symlink focus.sh to something in your path, e.g. to `~/bin/focus`.
5. Using the shortcuts.app in OSX, create a "Focus On" and "Focus Off" shortcut that does just that (turns on or off Focus mode).

## usage
Run `focus <minutes> <title>` to
1. Create a calendar event for the alloted time.
2. Set slack status to "focus" and turn off notifications.
3. Enable "Focus" mode in OSX.
N.B. CTRL-C will cancel the focus window and adjust the calendar event time correctly.
