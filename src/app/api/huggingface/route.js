import { NextResponse } from "next/server";
import { fetchAllTrendingDataAPIs } from "@/lib/apiFetcher";
/**
 * Calculates the start date for the current week (Monday at 00:00:00).
 * @returns {Date} - A Date object representing the start of Monday.
 */
function getThisWeekStartDate() {
  const now = new Date();
  const today = new Date(now);

  const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0); // Set to the beginning of Monday

  return monday;
}

export async function GET() {
  const monday = getThisWeekStartDate();
  const likeWeight = 100; // Weight to give 'likes' in our score
  const fetchLimit = 200; // How many recent models to fetch initially
  const returnLimit = 20; // How many top models to return

  // Fetch models sorted by lastModified, get full details, limit to 200
  // We can also add a filter e.g. '&filter=text-generation' if needed
  const HF_API_URL = `https://huggingface.co/api/models?sort=lastModified&direction=-1&limit=${fetchLimit}&full=true`;

  console.log(`Workspaceing from Hugging Face: ${HF_API_URL}`);

  try {
    const response = await fetch(HF_API_URL, {
        method: 'GET',
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API Error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch Hugging Face models: ${response.statusText}`);
    }

    const models = await response.json();

    // 1. Filter models modified within the current week
    const thisWeekModels = models.filter(model => {
        const lastModifiedDate = new Date(model.lastModified);
        return lastModifiedDate >= monday;
    });

    console.log(`Found ${thisWeekModels.length} models updated this week.`);

    // 2. Calculate the "Trending Score"
    const scoredModels = thisWeekModels.map(model => {
        const downloads = model.downloads || 0;
        const likes = model.likes || 0;
        const trendingScore = downloads + (likes * likeWeight);

        return {
            id: model.modelId, // Use modelId as the identifier
            author: model.author,
            downloads: downloads,
            likes: likes,
            lastModified: model.lastModified,
            tags: model.tags || [],
            pipeline_tag: model.pipeline_tag,
            trending_score: trendingScore,
        };
    });

    // 3. Sort by the new "Trending Score"
    scoredModels.sort((a, b) => b.trending_score - a.trending_score);

    // 4. Return the top N models
    return NextResponse.json(scoredModels.slice(0, returnLimit));

  } catch (error) {
    console.error('Hugging Face fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}