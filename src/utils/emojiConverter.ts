// Emoji shortcode to Unicode mapping
const emojiMap: Record<string, string> = {
  // Common company/brand emojis
  ':large_blue_diamond:': '🔷',
  ':large_orange_diamond:': '🔶',
  ':small_blue_diamond:': '🔹',
  ':small_orange_diamond:': '🔸',
  ':office:': '🏢',
  ':factory:': '🏭',
  ':building:': '🏢',
  ':hospital:': '🏥',
  ':school:': '🏫',
  ':department_store:': '🏬',
  ':bank:': '🏦',
  ':hotel:': '🏨',
  ':convenience_store:': '🏪',
  ':blue_square:': '🟦',
  ':orange_square:': '🟧',
  ':green_square:': '🟩',
  ':purple_square:': '🟪',
  ':red_square:': '🟥',
  ':yellow_square:': '🟨',
  ':white_square:': '⬜',
  ':black_square:': '⬛',

  // Education emojis
  ':mortar_board:': '🎓',
  ':graduation_cap:': '🎓',
  ':books:': '📚',
  ':book:': '📖',
  ':pencil:': '✏️',
  ':pencil2:': '✏️',

  // Tech/business emojis
  ':computer:': '💻',
  ':laptop:': '💻',
  ':desktop_computer:': '🖥️',
  ':keyboard:': '⌨️',
  ':briefcase:': '💼',
  ':chart_with_upwards_trend:': '📈',
  ':chart_with_downwards_trend:': '📉',
  ':bar_chart:': '📊',
  ':bar-chart:': '📊',
  ':chart:': '📊',
  ':rocket:': '🚀',
  ':bulb:': '💡',
  ':light_bulb:': '💡',
  ':gear:': '⚙️',
  ':wrench:': '🔧',
  ':hammer:': '🔨',
  ':tools:': '🛠️',

  // People/avatar emojis
  ':bust_in_silhouette:': '👤',
  ':busts_in_silhouette:': '👥',
  ':man:': '👨',
  ':woman:': '👩',
  ':technologist:': '🧑‍💻',
  ':man_technologist:': '👨‍💻',
  ':woman_technologist:': '👩‍💻',

  // Other common emojis
  ':star:': '⭐',
  ':star2:': '🌟',
  ':sparkles:': '✨',
  ':trophy:': '🏆',
  ':medal:': '🏅',
  ':100:': '💯',
  ':fire:': '🔥',
  ':zap:': '⚡',
  ':globe_with_meridians:': '🌐',
  ':earth_americas:': '🌎',
  ':earth_asia:': '🌏',
  ':earth_africa:': '🌍',
};

/**
 * Converts emoji shortcodes to actual emoji Unicode characters
 * @param text - String that may contain emoji shortcodes like :emoji_name:
 * @returns String with shortcodes replaced by actual emojis
 */
export function convertEmojis(text: string | undefined | null): string {
  if (!text) return '';

  // Replace all emoji shortcodes with their Unicode equivalents
  let result = text;
  Object.entries(emojiMap).forEach(([shortcode, emoji]) => {
    result = result.replace(new RegExp(shortcode.replace(/:/g, '\\:'), 'g'), emoji);
  });

  return result;
}

/**
 * Extracts emoji shortcode from text and converts to emoji
 * Useful for fields that only contain an emoji shortcode
 * @param text - Emoji shortcode like :emoji_name:, emoji_name, or emoji-name
 * @returns Emoji character or original text if no match found
 */
export function getEmoji(text: string | undefined | null): string {
  if (!text) return '';

  // If already an emoji (unicode character), return as-is
  if (/\p{Emoji}/u.test(text) && text.length <= 2) {
    return text;
  }

  // Normalize shortcode format - try with colons first
  let normalized = text.startsWith(':') && text.endsWith(':')
    ? text
    : `:${text}:`;

  // Check direct match
  if (emojiMap[normalized]) {
    return emojiMap[normalized];
  }

  // Try converting hyphens to underscores
  const withUnderscores = normalized.replace(/-/g, '_');
  if (emojiMap[withUnderscores]) {
    return emojiMap[withUnderscores];
  }

  // Try converting underscores to hyphens
  const withHyphens = normalized.replace(/_/g, '-');
  if (emojiMap[withHyphens]) {
    return emojiMap[withHyphens];
  }

  // Return original text if no match found
  return text;
}
