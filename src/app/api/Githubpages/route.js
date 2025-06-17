import { NextResponse } from 'next/server';

function getThisWeekStartDateForGithub() {
    // ... (no changes to this function)
    const now = new Date();
    const today = new Date(now);

    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

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
    const now = new Date();

    const keywords = 'AI OR LLM OR "large language model" OR transformer OR diffusion OR "machine learning" model';
    const minStars = 10; // Increase min stars to filter noise further
    const query = encodeURIComponent(`${keywords} created:>=${startDate} stars:>=${minStars}`);

    // Sort by stars initially to get the most popular ones, then re-sort with our score
    const GITHUB_API_URL = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=100`;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const headers = {
        Accept: 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    console.log(`Fetching from GitHub: ${GITHUB_API_URL}`);

    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: headers,
            next: { revalidate: 1800 }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('GitHub API Error:', errorData);
            throw new Error(`GitHub API returned status ${response.status}: ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();

        // --- STRATEGY CONFIGURATION ---
        const forkWeight = 2.0;
        const recentPushBonus = 1.5; // Multiplier for repos pushed to in the last 2 days
        // --- END STRATEGY CONFIGURATION ---

        const scoredRepos = data.items.map((repo) => {
            const createdAt = new Date(repo.created_at);
            const pushedAt = new Date(repo.pushed_at);
            const stars = repo.stargazers_count;
            const forks = repo.forks_count;

            // 1. Calculate Star Velocity
            const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
            // Add 1 to the denominator to avoid division by zero and extreme values for brand new repos
            const starVelocity = stars / (daysSinceCreation + 1);

            // 2. Check for Recent Activity
            const daysSincePush = (now.getTime() - pushedAt.getTime()) / (1000 * 3600 * 24);
            const pushBonus = daysSincePush <= 2 ? recentPushBonus : 1.0;

            // 3. Calculate Final Velocity Score
            const velocityScore = (starVelocity * pushBonus) + (forks * forkWeight);

            return {
                id: repo.id,
                name: repo.full_name,
                description: repo.description,
                url: repo.html_url,
                stars: stars,
                forks: forks,
                language: repo.language,
                created_at: repo.created_at,
                pushed_at: repo.pushed_at,
                velocity_score: velocityScore,
            };
        });

        // Re-sort based on our new velocity_score
        scoredRepos.sort((a, b) => b.velocity_score - a.velocity_score);

        return NextResponse.json(scoredRepos.slice(0, 25)); // Return top 25

    } catch (error) {
        console.error('GitHub fetch error:', error.message);
        return NextResponse.json({ error: `Failed to fetch data from GitHub: ${error.message}` }, { status: 500 });
    }
}