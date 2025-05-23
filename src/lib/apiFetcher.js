export async function fetchAllTrendingDataAPIs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';

    const arxivResponse = await fetch(`${baseUrl}/api/Arxivpages`);
    const huggingfaceResponse = await fetch(`${baseUrl}/api/huggingface`);
    const githubResponse = await fetch(`${baseUrl}/api/Githubpages`);

    if (!arxivResponse.ok) {
      console.error('Error fetching ArXiv data:', arxivResponse.status);
      return { arxiv: null, huggingface: null, github: null, error: 'Failed to fetch ArXiv data' };
    }
    if (!huggingfaceResponse.ok) {
      console.error('Error fetching Hugging Face data:', huggingfaceResponse.status);
      return { arxiv: null, huggingface: null, github: null, error: 'Failed to fetch Hugging Face data' };
    }
    if (!githubResponse.ok) {
      console.error('Error fetching GitHub data:', githubResponse.status);
      return { arxiv: null, huggingface: null, github: null, error: 'Failed to fetch GitHub data' };
    }

    const arxivData = await arxivResponse.json();
    const huggingfaceData = await huggingfaceResponse.json();
    const githubData = await githubResponse.json();

    return {
      arxiv: arxivData,
      huggingface: huggingfaceData,
      github: githubData,
      error: null,
    };

  } catch (error) {
    console.error('Error fetching all trending data:', error);
    return {
      arxiv: null,
      huggingface: null,
      github: null,
      error: 'An error occurred while fetching trending data',
    };
  }
}