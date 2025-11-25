// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_OMNI_MOMENT_SIG
// This Vercel Edge Function securely proxies requests to the OpenWeather API.
// It keeps the API key on the server-side, preventing client-side exposure.

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Security: Enforce GET method
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  // Security: Origin/Host Check for production environments
  if (process.env.NODE_ENV === 'production') {
    const requestHost = request.headers.get('host');
    const allowedHost = process.env.VERCEL_URL;

    if (!requestHost || requestHost !== allowedHost) {
      return new Response('Forbidden: Invalid host.', { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!lat || !lon) {
    return new Response('Missing latitude or longitude parameters', { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return new Response('Weather API key not configured on the server.', { status: 500 });
  }

  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
  try {
    const weatherResponse = await fetch(weatherApiUrl);
    const responseText = await weatherResponse.text();
    
    if (!weatherResponse.ok) {
        console.error(`OpenWeather API error: ${weatherResponse.statusText}`, responseText);
        throw new Error(`OpenWeather API error: ${weatherResponse.statusText}`);
    }

    let weatherData: any;
    try {
        weatherData = JSON.parse(responseText);
    } catch (e) {
        throw new Error(`Failed to parse weather API response as JSON. Response: ${responseText.slice(0, 200)}`);
    }

    if (typeof weatherData !== 'object' || weatherData === null || !weatherData.weather || !Array.isArray(weatherData.weather) || !weatherData.main) {
        throw new Error(`Invalid weather API data format.`);
    }

    const simplifiedData = {
        main: weatherData.weather[0]?.main, // e.g., "Rain"
        description: weatherData.weather[0]?.description, // e.g., "light rain"
        temp: weatherData.main?.temp, // e.g., 28.5
    };

    return new Response(JSON.stringify(simplifiedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300', // Cache on CDN for 10min, allow stale for 5min
      },
    });
  } catch (error) {
    console.error("Error in weather proxy function:", error);
    return new Response('Error fetching external weather data.', { status: 502 }); // 502 Bad Gateway is appropriate here
  }
}
