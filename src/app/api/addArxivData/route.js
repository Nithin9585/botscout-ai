import { firestore } from "../../../../firebase/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { data } = await req.json();
    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
    }

    const arxivCollection = collection(firestore, "arxiv_data");

    for (const paper of data) {
      // Ensure the document ID is valid for Firestore by replacing slashes
      const sanitizedId = (paper.id || paper.title).replace(/\//g, "_");

      await setDoc(doc(arxivCollection, sanitizedId), {
        id: paper.id || paper.title,
        title: paper.title || "No Title",
        url: `https://arxiv.org/abs/${paper.id}`,
        summary: paper.summary || "No summary available",
        authors: paper.authors || [],
        published: paper.published || "Unknown Date",
      });
    }

    return new Response(JSON.stringify({ message: "ArXiv data added successfully" }), { status: 200 });
  } catch (error) {
    console.error("🔥 Error in addArxivData API:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
