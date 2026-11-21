/**
 * Pakistani Name Normalization & Fuzzy Matching Engine
 * Implements Jaro-Winkler distance and phonetic rules for Urdu/Pakistani transliterated names.
 * Team Thunder | FAST-NUCES Karachi AI Hackathon
 */

export function normalizePakistaniName(rawName: string): string {
  if (!rawName) return '';
  let name = rawName.trim().toLowerCase();

  // Normalize common Pakistani prefix/suffix variants
  name = name.replace(/\b(muhammad|mohammad|mohamed|mohammed|md|mhd)\b/g, 'muhammad');
  name = name.replace(/\b(ahmed|ahmad)\b/g, 'ahmed');
  name = name.replace(/\b(ali|aly)\b/g, 'ali');
  name = name.replace(/\b(hassan|hasan)\b/g, 'hassan');
  name = name.replace(/\b(hussain|hussein|hussan)\b/g, 'hussain');
  name = name.replace(/\b(khan|khaan)\b/g, 'khan');
  name = name.replace(/\b(bibi|begum|khatoon|mai)\b/g, 'bibi');
  name = name.replace(/\b(fatima|fatimah)\b/g, 'fatima');
  name = name.replace(/\b(ayesha|aisha|aysha)\b/g, 'ayesha');
  name = name.replace(/\b(rashida|rasheeda)\b/g, 'rashida');
  name = name.replace(/\b(parveen|parvin)\b/g, 'parveen');
  name = name.replace(/\b(syed|sayed|saiyed)\b/g, 'syed');
  name = name.replace(/\b(sheikh|shaikh)\b/g, 'sheikh');
  name = name.replace(/\b(chaudhry|choudhary|chaudhary)\b/g, 'chaudhry');

  // Strip punctuation and extra spaces
  name = name.replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
  return name.trim();
}

/**
 * Calculates standard Jaro Similarity
 */
function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const m = matches;
  return (m / s1.length + m / s2.length + (m - transpositions / 2) / m) / 3;
}

/**
 * Calculates Jaro-Winkler Similarity with prefix boost (p = 0.1)
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  const norm1 = normalizePakistaniName(str1);
  const norm2 = normalizePakistaniName(str2);

  if (norm1 === norm2) return 1.0;
  if (!norm1.length || !norm2.length) return 0.0;

  const jaro = jaroSimilarity(norm1, norm2);

  // Common prefix length up to 4 characters
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(norm1.length, norm2.length)); i++) {
    if (norm1[i] === norm2[i]) prefix++;
    else break;
  }

  const p = 0.1; // standard scaling factor
  return Math.min(1.0, Number((jaro + prefix * p * (1 - jaro)).toFixed(4)));
}

/**
 * Standard Levenshtein distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
