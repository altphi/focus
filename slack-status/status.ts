import { parse } from "https://deno.land/std/flags/mod.ts";

async function setSlackStatus(text: string, emoji: string, token: string, duration?: number) {
  const profile: any = {
    status_text: text,
    status_emoji: emoji
  };
  
  if (duration) {
    profile.status_expiration = Math.floor(Date.now() / 1000) + (duration * 60);
  }

  const response = await fetch('https://slack.com/api/users.profile.set', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ profile })
  });

  const result = await response.json();
  if (!result.ok) {
    console.error('Error setting status:', result.error);
    Deno.exit(1);
  }
  
  console.log('Status updated successfully!');
}

async function clearStatus(token: string) {
  const response = await fetch('https://slack.com/api/users.profile.set', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      profile: {
        status_text: "",
        status_emoji: ""
      }
    })
  });

  const result = await response.json();
  if (!result.ok) {
    console.error('Error clearing status:', result.error);
    Deno.exit(1);
  }

  console.log('Status cleared successfully!');
}

async function setPresence(token: string, away: boolean) {
  const presence = away ? 'away' : 'auto';
  const response = await fetch(`https://slack.com/api/users.setPresence`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ presence })
  });

  const result = await response.json();
  if (!result.ok && result.error !== 'missing_scope') {
    console.error('Error setting presence:', result.error);
    Deno.exit(1);
  }

  if (result.ok) {
    console.log(`Presence set to ${presence}`);
  }
}

async function setDND(token: string, minutes: number) {
  const response = await fetch(`https://slack.com/api/dnd.setSnooze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ num_minutes: minutes })
  });

  const result = await response.json();
  if (!result.ok && result.error !== 'missing_scope') {
    console.error('Error setting DND:', result.error);
    Deno.exit(1);
  }

  if (result.ok) {
    console.log(`DND enabled for ${minutes} minutes`);
  }
}

async function endDND(token: string) {
  const response = await fetch(`https://slack.com/api/dnd.endSnooze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  const result = await response.json();
  if (!result.ok && result.error !== 'missing_scope') {
    console.error('Error ending DND:', result.error);
    Deno.exit(1);
  }

  if (result.ok) {
    console.log('DND disabled');
  }
}

async function getCurrentStatus(token: string) {
  const response = await fetch('https://slack.com/api/users.profile.get', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  const result = await response.json();
  if (!result.ok) {
    console.error('Error getting status:', result.error);
    Deno.exit(1);
  }

  return result.profile;
}

async function getDNDStatus(token: string) {
  const response = await fetch('https://slack.com/api/dnd.info', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  const result = await response.json();
  if (!result.ok && result.error !== 'missing_scope') {
    console.error('Error getting DND status:', result.error);
    Deno.exit(1);
  }

  return result;
}

async function getPresence(token: string) {
  const response = await fetch('https://slack.com/api/users.getPresence', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  const result = await response.json();
  if (!result.ok && result.error !== 'missing_scope') {
    console.error('Error getting presence:', result.error);
    Deno.exit(1);
  }

  return result;
}

async function displayCurrentState(token: string) {
  console.log('Checking current Slack state...\n');

  const profile = await getCurrentStatus(token);
  console.log('Status:');
  if (profile.status_text || profile.status_emoji) {
    console.log(`  Text: ${profile.status_text || 'None'}`);
    console.log(`  Emoji: ${profile.status_emoji || 'None'}`);
    if (profile.status_expiration) {
      const expirationDate = new Date(profile.status_expiration * 1000);
      console.log(`  Expires: ${expirationDate.toLocaleString()}`);
    }
  } else {
    console.log('  No status set');
  }

  const dnd = await getDNDStatus(token);
  console.log('\nDo Not Disturb:');
  if (dnd.ok && dnd.snooze_enabled) {
    const endTime = new Date(dnd.snooze_endtime * 1000);
    console.log(`  Enabled until ${endTime.toLocaleString()}`);
  } else {
    console.log('  Disabled');
  }

  const presence = await getPresence(token);
  if (presence.ok) {
    console.log('\nPresence:');
    console.log(`  ${presence.presence === 'away' ? 'Away' : 'Active'}`);
  }
}

const flags = parse(Deno.args, {
  string: ['text', 'emoji', 'token'],
  boolean: ['away', 'clear', 'status'],
  number: ['minutes'],
  alias: {
    t: 'text',
    e: 'emoji',
    m: 'minutes',
    a: 'away',
    c: 'clear',
    s: 'status',
    h: 'help'
  },
});

if (flags.help) {
  console.log(`
Usage: deno run --allow-net status.ts [options]

Options:
  -t, --text      Status text
  -e, --emoji     Status emoji (e.g., :headphones:)
  -m, --minutes   Duration in minutes for status and DND
  -a, --away      Set presence to away
  -c, --clear     Clear status, set presence to active, and turn off DND
  -s, --status    Display current status, DND state, and presence
  --token         Slack user token
  -h, --help      Show help

Examples:
  # Set focus mode for 30 minutes
  deno run --allow-net status.ts \\
    --text "Deep work" \\
    --emoji ":headphones:" \\
    --minutes 30 \\
    --away

  # Check current status
  deno run --allow-net status.ts --status

  # Clear everything and return to normal
  deno run --allow-net status.ts --clear
`);
  Deno.exit(0);
}

const token = flags.token || Deno.env.get('SLACK_USER_TOKEN');
if (!token) {
  console.error('Please provide a Slack token via --token or SLACK_USER_TOKEN environment variable');
  Deno.exit(1);
}

if (flags.status) {
  await displayCurrentState(token);
  Deno.exit(0);
}

if (flags.clear) {
  await clearStatus(token);
  await setPresence(token, false);
  await endDND(token);
  Deno.exit(0);
}

if (!flags.text || !flags.emoji) {
  console.error('Please provide both status text and emoji');
  Deno.exit(1);
}

await setSlackStatus(flags.text, flags.emoji, token, flags.minutes);

if (flags.away) {
  await setPresence(token, true);
}

if (flags.minutes) {
  await setDND(token, flags.minutes);
}