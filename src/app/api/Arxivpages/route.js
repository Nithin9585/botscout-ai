import { parseStringPromise } from 'xml2js';
import { NextResponse } from 'next/server';

/**
 * Calculates the start and end dates for the current week (Monday to Now)
 * and formats them for the arXiv API.
 * @returns {object} - An object containing the formatted start and end dates.
 */
function getCurrentWeekDateRangeForArxiv() {
  const now = new Date();
  const today = new Date(now); // Create a copy

  const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // Calculate the difference in days to get back to the most recent Monday.
  // If today is Sunday (0), we go back 6 days. Otherwise, we go back (dayOfWeek - 1) days.
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0); // Set to the beginning of Monday

  // Function to format date as YYYYMMDDHHMM
  const formatDateForArxiv = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    // Ensure seconds are 00 for broader matching or use current if needed
    // const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}${hh}${min}`;
  };

  return {
    startDate: formatDateForArxiv(monday),
    endDate: formatDateForArxiv(now),
  };
}

export async function GET() {
  const { startDate, endDate } = getCurrentWeekDateRangeForArxiv();

  // Define your search query (e.g., AI, Machine Learning, etc.)
  const searchQuery = 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL'; // Example: AI, ML, NLP categories

  // Construct the API URL:
  // - Search within the calculated date range using `submittedDate`.
  // - Use your desired search query (e.g., 'all:AI' or specific categories).
  // - Sort by `relevance` - this is arXiv's internal score, the best proxy for trending.
  // - Increase `max_results` to get a decent pool (e.g., 25 or 50).
  const apiUrl = `https://export.arxiv.org/api/query?search_query=(${searchQuery})+AND+submittedDate:[${startDate}+TO+${endDate}]&sortBy=relevance&start=0&max_results=25`;

  console.log(`Workspaceing from arXiv: ${apiUrl}`); // Log the URL for debugging

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Revalidate cache every hour

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`ArXiv API Error: ${response.status} - ${errorText}`);
        return NextResponse.json({ error: `Error fetching data from Arxiv: ${response.statusText}` }, { status: response.status });
    }

    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData, { explicitArray: false });
    console.log('Parsed XML:', result); // Log the parsed XML for debugging

    // Ensure 'entry' exists and is an array (or wrap if it's a single object)
    let entries = [];
    if (result.feed && result.feed.entry) {
        entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
    }

    // Optional: Further local processing/scoring could be added here
    // if you had external data, but based purely on arXiv, this is the best approach.

    return NextResponse.json(entries);

  } catch (error) {
    console.error('Error in GET function:', error);
    return NextResponse.json({ error: 'Error fetching or parsing data from Arxiv' }, { status: 500 });
  }
}