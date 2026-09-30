export type VocabularyWord = {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  collocations: string[];
};

export type VocabularyTopic = {
  name: string;
  description: string;
  words: VocabularyWord[];
};

export function validateVocabularyTopics(value: unknown): { topics: VocabularyTopic[] | null; errors: string[] } {
  const errors: string[] = [];
  if (!Array.isArray(value) || value.length === 0) {
    return { topics: null, errors: ["JSON root must be a non-empty array of vocabulary topics."] };
  }

  const names = new Set<string>();
  const words = new Set<string>();
  value.forEach((topic, topicIndex) => {
    const topicPath = `topics[${topicIndex}]`;
    if (!topic || typeof topic !== "object" || Array.isArray(topic)) {
      errors.push(`${topicPath} must be an object.`);
      return;
    }
    const item = topic as Record<string, unknown>;
    for (const field of ["name", "description"]) {
      if (typeof item[field] !== "string" || !item[field].trim()) errors.push(`${topicPath}.${field} must be a non-empty string.`);
    }
    if (typeof item.name === "string") {
      const normalizedName = item.name.trim().toLowerCase();
      if (names.has(normalizedName)) errors.push(`${topicPath}.name duplicates another topic.`);
      names.add(normalizedName);
    }
    if (!Array.isArray(item.words) || item.words.length === 0) {
      errors.push(`${topicPath}.words must be a non-empty array.`);
      return;
    }
    item.words.forEach((word, wordIndex) => {
      const wordPath = `${topicPath}.words[${wordIndex}]`;
      if (!word || typeof word !== "object" || Array.isArray(word)) {
        errors.push(`${wordPath} must be an object.`);
        return;
      }
      const entry = word as Record<string, unknown>;
      for (const field of ["word", "partOfSpeech", "definition", "example"]) {
        if (typeof entry[field] !== "string" || !entry[field].trim()) errors.push(`${wordPath}.${field} must be a non-empty string.`);
      }
      if (typeof entry.word === "string") {
        const normalizedWord = entry.word.trim().toLowerCase();
        if (words.has(normalizedWord)) errors.push(`${wordPath}.word duplicates another word in this file.`);
        words.add(normalizedWord);
      }
      if (!Array.isArray(entry.collocations) || entry.collocations.length === 0 || !entry.collocations.every((item) => typeof item === "string" && item.trim())) {
        errors.push(`${wordPath}.collocations must be a non-empty array of strings.`);
      }
    });
  });

  return errors.length
    ? { topics: null, errors }
    : { topics: value as VocabularyTopic[], errors };
}
