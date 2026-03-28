const API_KEY = 'ER2uZS5PgBVkCSFDOEwZlypoJCYmy1nCD8eAT92r3wphdhxdRZctbXgkrZ2toytI';
const YEAR = new Date().getFullYear();

const team_number = Deno.args[0];
const team_key = `frc${team_number}`;
console.log(`HUD for team ${team_number}`)

async function tba(route) {
  const url = `https://www.thebluealliance.com/api/v3${route}`;
  const result = (await fetch(url, {
    headers: {
      'X-TBA-Auth-Key': API_KEY,
    }
  })).json();

  await Deno.writeTextFile(
    `sample_data/${new Date().getTime()}.json`,
    JSON.stringify(result),
  );
  return result;
}

function formatClock(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [h, m, s]
    .map(v => v.toString().padStart(2, "0"))
    .join(":");
}

function sortBy(arr, iteratee) {
  return [...arr].sort((a, b) => {
    const av = iteratee(a);
    const bv = iteratee(b);

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    return av < bv ? -1 : av > bv ? 1 : 0;
  });
}

const events = await tba(`/team/${team_key}/events/${YEAR}`);
const current_events = events.filter((e) => {
  const today = new Date();
  return new Date(e.start_date) <= today && today <= new Date(e.end_date);
});

if (current_events.length == 0) {
  console.error(`No events in progress for team ${team_number}`);
  process.exit(1);
}

if (current_events.length > 1) {
  console.error(`${current_events.length} events in progress for team ${team_number}`);
  process.exit(1);
}

const current_event = current_events[0];

const matches = await tba(`/team/${team_key}/event/${current_event.key}/matches`);

const next_match = sortBy(
  matches.filter(m => m.actual_time == null),
  m => m.predicted_time
)[0];

if (next_match == null) {
  console.error(`No more matches for team ${team_number}`);
  process.exit(1);
}

console.log(`Match number: ${next_match.match_number}`);
console.log(`Estimated start in: ${formatClock(next_match.predicted_time - new Date() / 1000)}`);

const is_blue = next_match.alliances.blue.team_keys.includes(team_key);
console.log(`Alliance: ${is_blue ? "Blue" : "Red"}`);

const alliance = is_blue ? next_match.alliances.blue : next_match.alliances.red;
console.log(`Station: ${alliance.team_keys.indexOf(team_key) + 1}`);

const enemy = is_blue ? next_match.alliances.red : next_match.alliances.blue;

const teammates = alliance.team_keys.filter(k => k != team_key).map(k => k.slice(3));
console.log(`Teammates: ${teammates}`);

console.log(`Against: ${enemy.team_keys.map(k => k.slice(3))}`);

const all_event_matches = await tba(`/event/${current_event.key}/matches`);
const current_match = sortBy(
  all_event_matches.filter(m => m.actual_time == null),
  m => m.predicted_time
)[0];

console.log();

const matches_to_go = next_match.match_number - current_match.match_number;
console.log(`Current match: ${current_match.match_number}`);
console.log(`Matches until you: ${matches_to_go}`);
if (matches_to_go == 1) {
  console.log(`ON DECK`);
}
