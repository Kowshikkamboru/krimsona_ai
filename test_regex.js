function extractPayloadAfterPhrase(text, phrases) {
  let best = text;
  for (const p of phrases) {
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flexRegex = new RegExp(escaped.split(/\s+/).join('\\s+(?:the\\s+|a\\s+|an\\s+)?'), 'i');
    const match = text.match(flexRegex);
    if (match && match.index !== undefined) {
      let after = text.slice(match.index + match[0].length).trim();
      after = after.replace(/^to\s+/i, '');
      if (after.length < best.length || best === text) best = after;
    }
  }
  return best;
}
const RENAME_PHRASES = ['rename', 'rename task', 'change title', 'change name', 'change task name', 'update title', 'update name', 'set title', 'set name', 'title is', 'call it', 'rename to', 'change title to', 'change name to', 'rename task to'];
console.log(extractPayloadAfterPhrase('change the title to fix the bug', RENAME_PHRASES));
console.log(extractPayloadAfterPhrase('change the title', RENAME_PHRASES));
console.log(extractPayloadAfterPhrase('set the name to super task', RENAME_PHRASES));
