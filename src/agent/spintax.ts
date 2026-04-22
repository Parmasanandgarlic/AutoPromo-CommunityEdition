export function parseSpintax(text: string): string {
  const regex = /\{([^{}]*)\}/g;
  let match;
  let result = text;
  
  // Handle nested spintax by repeatedly parsing until no more matches
  while ((match = regex.exec(result)) !== null) {
    const options = match[1].split('|');
    const replacement = options[Math.floor(Math.random() * options.length)];
    result = result.replace(match[0], replacement);
    regex.lastIndex = 0; // Reset regex index after replacement
  }
  
  return result;
}
