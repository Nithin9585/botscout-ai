import { NextResponse } from "next/server";
import { sendWeeklyAiSnapshotEmail } from "@/lib/mailer"; // Assuming this is the correct mailer function
import { fetchAllTrendingDataAPIs } from "@/lib/apiFetcher";

export async function GET() {
  try {
    const allData = await fetchAllTrendingDataAPIs();

    // Check for errors returned by fetchAllTrendingDataAPIs
    if (allData.error) {
      console.error('Error fetching all trending data:', allData.error);
      return NextResponse.json({ error: allData.error }, { status: 500 });
    }

    // Attempt to send the weekly email
    const emailResult = await sendWeeklyAiSnapshotEmail(allData);

    if (emailResult.success) {
      console.log('Weekly trending email sent successfully');
      return NextResponse.json({ message: 'Weekly trending email sent successfully' }, { status: 200 });
    } else {
      console.error('Failed to send weekly trending email:', emailResult.error);
      return NextResponse.json({ error: `Failed to send weekly email: ${emailResult.error}` }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error in /api/send-weekly-email:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while sending the weekly email' }, { status: 500 });
  }
}