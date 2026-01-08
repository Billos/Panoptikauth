const continentEmoji = {
  AF: "🌍",
  AN: "❄️",
  AS: "🌏",
  EU: "🌍",
  NA: "🌎",
  OC: "🌏",
  SA: "🌎",
}

export function getContinentEmoji(continentCode: string): string | undefined {
  return continentEmoji[continentCode as keyof typeof continentEmoji] || "🌐"
}

const countryEmoji = {
  US: "🇺🇸",
  CA: "🇨🇦",
  FR: "🇫🇷",
  GB: "🇬🇧",
}

export function getCountryEmoji(countryCode: string): string | undefined {
  return countryEmoji[countryCode as keyof typeof countryEmoji] || "🧭"
}
