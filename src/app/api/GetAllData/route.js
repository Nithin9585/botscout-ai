import { firestore } from "../../../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const githubSnapshot = await getDocs(collection(firestore, "github_data"));
    const githubData = githubSnapshot.docs.map(doc => doc.data());

    const huggingfaceSnapshot = await getDocs(collection(firestore, "huggingface_data"));
    const huggingfaceData = huggingfaceSnapshot.docs.map(doc => doc.data());

    const arxivSnapshot = await getDocs(collection(firestore, "arxiv_data"));
    const arxivData = arxivSnapshot.docs.map(doc => doc.data());

    const combinedData = {
      githubData,
      huggingfaceData,
      arxivData
    };

    return new Response(JSON.stringify(combinedData), { status: 200 });
  } catch (error) {
    console.error("🔥 Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}
