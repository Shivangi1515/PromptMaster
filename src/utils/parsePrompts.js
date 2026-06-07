export function parsePrompts(raw) {
  if (!raw) return { p1: '', p2: '', p3: '' };

  const p1Match = raw.match(/PROMPT\s*1[\s\S]*?(?=PROMPT\s*2|$)/i);
  const p2Match = raw.match(/PROMPT\s*2[\s\S]*?(?=PROMPT\s*3|$)/i);
  const p3Match = raw.match(/PROMPT\s*3[\s\S]*/i);

  const clean = (str) => {
    if (!str) return '';
    return str
      .replace(/^PROMPT\s*\d+\s*[-—–]?\s*(PLANNING.*?|IMPLEMENTATION.*?|REVIEW.*?|ARCHITECTURE.*?|TESTING.*?|OPTIMIZATION.*?)?\n/i, '')
      .trim();
  };

  const hasValid = p1Match && p2Match && p3Match;

  if (hasValid) {
    return {
      p1: clean(p1Match[0]),
      p2: clean(p2Match[0]),
      p3: clean(p3Match[0]),
    };
  }

  const third = Math.ceil(raw.length / 3);
  return {
    p1: raw.slice(0, third).trim(),
    p2: raw.slice(third, third * 2).trim(),
    p3: raw.slice(third * 2).trim(),
  };
}
