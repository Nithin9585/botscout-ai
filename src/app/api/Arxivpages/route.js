import { parseStringPromise } from 'xml2js';
import { NextResponse } from 'next/server';

// --- STRATEGY CONFIGURATION (No changes here) ---
const CATEGORY_WEIGHTS = {
    'cs.CL': 1.5,
    'cs.CV': 1.3,
    'cs.LG': 1.2,
    'cs.AI': 1.0,
};

const KEYWORD_WEIGHTS = {
    'transformer': 10,
    'attention': 8,
    'diffusion': 12,
    'llm': 15,
    'large language model': 15,
    'retrieval-augmented generation': 18,
    'rag': 18,
    'mixture of experts': 20,
    'moe': 20,
};
// --- END STRATEGY CONFIGURATION ---

function getCurrentWeekDateRangeForArxiv() {
    const now = new Date();
    const today = new Date(now);

    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const formatDateForArxiv = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}${mm}${dd}${hh}${min}`;
    };

    return {
        startDate: formatDateForArxiv(monday),
        endDate: formatDateForArxiv(now),
    };
}

async function calculateImpactScores(entries) {
    const now = new Date();

    return entries.map(entry => {
        // --- SCORE CALCULATION (No changes here) ---
        const title = entry.title.toLowerCase();
        const summary = entry.summary.toLowerCase();
        const content = `${title} ${summary}`;

        let keywordBonus = 0;
        for (const keyword in KEYWORD_WEIGHTS) {
            if (content.includes(keyword)) {
                keywordBonus += KEYWORD_WEIGHTS[keyword];
            }
        }

        // --- FIX APPLIED HERE: More robust category handling ---
        // Ensure category and its term exist before accessing.
        // If entry.category or entry.category.$ or entry.category.$.term is missing,
        // primaryCategory will default to 'unknown'.
        const primaryCategory = entry.category?.$.term || 'unknown';
        const categoryBonus = CATEGORY_WEIGHTS[primaryCategory] || 1.0;

        const authorCount = Array.isArray(entry.author) ? entry.author.length : 1;
        const collaborationBonus = Math.log1p(authorCount) * 5;

        const publishedDate = new Date(entry.published);
        const daysOld = (now.getTime() - publishedDate.getTime()) / (1000 * 3600 * 24);
        const recencyMultiplier = Math.max(0.1, 1 / (daysOld + 1));

        const baseScore = 10;
        const impactScore = (baseScore + keywordBonus + collaborationBonus) * categoryBonus * recencyMultiplier;
        // --- END SCORE CALCULATION ---

        const authors = Array.isArray(entry.author) ? entry.author.map(a => a.name) : [entry.author.name];

        // The raw ID from arXiv is a URL, e.g., "http://arxiv.org/abs/2401.12345v1"
        // We extract the clean ID part to prevent errors on the frontend.
        const rawUrlId = entry.id; // We already filtered to ensure this is a string.
        const cleanPaperId = rawUrlId.split('/abs/').pop() || ''; // Safely gets "2401.12345v1"

        return {
            // Use the clean, simple ID. This is what the frontend component needs.
            id: cleanPaperId,
            title: entry.title,
            summary: entry.summary.trim(),
            authors: authors,
            published: entry.published,
            updated: entry.updated,
            // Provide the original full URL as a separate field.
            url: rawUrlId,
            pdf: entry.link.find(l => l.$.title === 'pdf')?.$.href,
            primary_category: primaryCategory,
            impact_score: impactScore,
        };
    });
}

export async function GET() {
    const { startDate, endDate } = getCurrentWeekDateRangeForArxiv();
    const searchQuery = 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL';
    const apiUrl = `https://export.arxiv.org/api/query?search_query=(${searchQuery})+AND+lastUpdatedDate:[${startDate}+TO+${endDate}]&sortBy=lastUpdatedDate&sortOrder=descending&start=0&max_results=100`;

    try {
        const response = await fetch(apiUrl, { next: { revalidate: 1800 } });
        if (!response.ok) {
            throw new Error(`ArXiv API error: ${response.status}`);
        }

        const xmlData = await response.text();
        const result = await parseStringPromise(xmlData, { explicitArray: false, trim: true });

        let entries = [];
        if (result.feed && result.feed.entry) {
            const rawEntries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];

            // --- FIX APPLIED HERE: More rigorous filtering ---
            // Filter the results to only include entries that have a valid ID string
            // AND ensure they have a category with a term, which is crucial for scoring.
            entries = rawEntries.filter(entry =>
                entry &&
                typeof entry.id === 'string' &&
                entry.id.includes('/abs/') &&
                entry.category && // Ensure category object exists
                entry.category.$ && // Ensure category.$. exists
                entry.category.$.term // Ensure category.$.term exists
            );
        }

        const scoredPapers = await calculateImpactScores(entries);

        scoredPapers.sort((a, b) => b.impact_score - a.impact_score);

        return NextResponse.json(scoredPapers.slice(0, 25));
    } catch (error) {
        console.error('Error fetching trending papers:', error);
        return NextResponse.json({
            error: 'Failed to fetch trending papers',
            details: error.message
        }, { status: 500 });
    }
}