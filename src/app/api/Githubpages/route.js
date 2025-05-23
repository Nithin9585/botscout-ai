import { NextResponse } from 'next/server';

/**
 * Calculates the start date for the current week (Monday)
 * and formats it for the GitHub API.
 * @returns {string} - The formatted start date (YYYY-MM-DD).
 */
function getThisWeekStartDateForGithub() {
  const now = new Date();
  const today = new Date(now);

  const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return formatDate(monday);
}

export async function GET() {
  const startDate = getThisWeekStartDateForGithub();

  // Define keywords for AI Models
  const keywords = 'AI OR LLM OR "large language model" OR transformer OR diffusion OR "machine learning" model';
  // Define a minimum star count to reduce noise (optional)
  const minStars = 5;
  // Construct the search query 'q'
  // We look for repos created since the start of this week, matching keywords, with a minimum star count.
  const query = encodeURIComponent(`${keywords} created:>=${startDate} stars:>=${minStars}`);

  // Construct the GitHub API URL - sort by stars initially
  const GITHUB_API_URL = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=50`; // Get top 50

  // --- IMPORTANT: AUTHENTICATION ---
  // For production/heavy use, you MUST use a token.
  // Store it in environment variables (e.g., process.env.GITHUB_TOKEN)
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  // ------------------------------------

  console.log(`Workspaceing from GitHub: ${GITHUB_API_URL}`);

  try {
    const response = await fetch(GITHUB_API_URL, {
        headers: headers,
        next: { revalidate: 1800 } // Revalidate cache every 30 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API returned status ${response.status}: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Define our fork weight for the trending score
    const forkWeight = 2;

    // Map and calculate our "Trending Score"
    const scoredRepos = data.items.map((repo) => {
        const trendingScore = repo.stargazers_count + (repo.forks_count * forkWeight);
        return {
            id: repo.id,
            name: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            created_at: repo.created_at,
            trending_score: trendingScore, // Our calculated score
        };
    });

    // Re-sort the list based on our calculated 'trending_score'
    scoredRepos.sort((a, b) => b.trending_score - a.trending_score);

    // Return the top N (e.g., top 20) trending repos
    return NextResponse.json(scoredRepos.slice(0, 20));

  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    return NextResponse.json(
      { error: `Failed to fetch data from GitHub: ${error.message}` },
      { status: 500 }
    );
  }
}