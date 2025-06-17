import { NextResponse } from "next/server";

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
  const likeWeight = 150; // Slightly increased weight for community approval
  const fetchLimit = 250; // Fetch a bit more to get a wider sample
  const returnLimit = 25; // Return a few more top models
  const now = new Date();

  // Fetch models sorted by lastModified, get full details
  const HF_API_URL = `https://huggingface.co/api/models?sort=lastModified&direction=-1&limit=${fetchLimit}&full=true`;

  console.log(`Fetching from Hugging Face: ${HF_API_URL}`);

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

    // 2. Calculate the new "Momentum Score"
    const scoredModels = thisWeekModels.map(model => {
      const downloads = model.downloads || 0;
      const likes = model.likes || 0;
      const lastModifiedDate = new Date(model.lastModified);

      const daysSinceUpdate = (now.getTime() - lastModifiedDate.getTime()) / (1000 * 3600 * 24);
      
      // Calculate download velocity with a smoothing factor
      const downloadVelocity = downloads / (daysSinceUpdate + 2);
      
      const momentumScore = downloadVelocity + (likes * likeWeight);

      // Add a freshness boost for very recent models
      let freshnessMultiplier = 1.0;
      if (daysSinceUpdate <= 1) {
        freshnessMultiplier = 1.5;
      } else if (daysSinceUpdate <= 3) {
        freshnessMultiplier = 1.2;
      }

      const finalScore = momentumScore * freshnessMultiplier;

      return {
        id: model.modelId,
        author: model.author,
        downloads: downloads,
        likes: likes,
        lastModified: model.lastModified,
        tags: model.tags || [],
        pipeline_tag: model.pipeline_tag,
        momentum_score: finalScore, // Use the new score for sorting
      };
    });

    // 3. Sort by the new "Momentum Score"
    scoredModels.sort((a, b) => b.momentum_score - a.momentum_score);

    // 4. Return the top N models
    return NextResponse.json(scoredModels.slice(0, returnLimit));

  } catch (error) {
    console.error('Hugging Face fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}