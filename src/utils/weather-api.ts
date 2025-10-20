import axios from "axios";

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export async function getWeatherData(city: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    // Demo mode without API key - returns fake data
    console.log(`[Weather API] Demo mode - simulated data for ${city}`);
    return {
      city: city,
      temperature: Math.round(15 + Math.random() * 15),
      description: ["Sunny", "Cloudy", "Rainy", "Partly cloudy"][
        Math.floor(Math.random() * 4)
      ],
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 10),
      icon: "01d",
    };
  }

  // Real call to OpenWeatherMap API
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: apiKey,
          units: "metric",
          lang: "en",
        },
      }
    );

    return {
      city: response.data.name,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed),
      icon: response.data.weather[0].icon,
    };
  } catch (error) {
    throw new Error(`Weather API error: ${error}`);
  }
}
