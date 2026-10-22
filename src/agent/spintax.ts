export function parseSpintax(text: string): string {
  if (!text || typeof text !== 'string') return '';
  const regex = /\{([^{}]*)\}/;
  let result = text;
  let iterations = 0;
  const maxIterations = 200;
  
  // Handle nested spintax by repeatedly parsing until no more matches
  while (iterations++ < maxIterations) {
    const match = regex.exec(result);
    if (!match) break;
    const options = match[1].split('|');
    const replacement = options[Math.floor(Math.random() * options.length)] ?? '';
    result = result.slice(0, match.index) + replacement + result.slice(match.index + match[0].length);
  }
  
  return result;
}
