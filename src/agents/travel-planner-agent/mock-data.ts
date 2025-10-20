export function getMockWebSearch(destination: string): string {
  return `MOCK WEB SEARCH RESULTS:

Top attractions in ${destination}:
- Historic old town with beautiful architecture
- Famous local markets and street food
- Popular beaches and coastal areas
- Museums and cultural centers
- Parks and natural reserves`;
}

export function getMockWeather(destination: string): string {
  return `Weather data retrieved for ${destination}. It's currently 22°C with clear sky.`;
}

export function getMockCalculation(): string {
  return `MOCK CALCULATION:

Hotel: $150/night × 7 nights = $1,050
Meals: $25/day × 7 days = $175
Total Budget: $1,225`;
}

export function getMockItinerary(departure: string, destination: string): string {
  return `## ${departure} to ${destination}: 1-Day Itinerary

Morning (9:00 - 12:00)
- Visit the historic old town
- Explore local markets
- Try traditional breakfast

Afternoon (12:00 - 18:00)
- Lunch at popular restaurant
- Visit main attractions and museums
- Walk through city parks

Evening (18:00 - 22:00)
- Dinner at waterfront restaurant
- Sunset viewing point
- Experience local nightlife

Budget: $1,225 for 7 nights
Weather: Expect pleasant 22°C with clear skies`;
}

export function getMockTranslation(text: string, language: string): string {
  return `[MOCK TRANSLATION TO ${language.toUpperCase()}]

${text}`;
}
