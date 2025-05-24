import nodemailer from "nodemailer";
import { firestore } from "../../firebase/firebase"; // Assuming firebase is correctly configured
import { collection, getDocs } from "firebase/firestore";

/**
 * Sends a weekly AI snapshot email to all subscribers in Firestore.
 * @param {Object} allData - Data containing trending GitHub repos, Hugging Face models, and ArXiv papers.
 * @returns {Promise<Object>} - Result of email sending process.
 */
export async function sendWeeklyAiSnapshotEmail(allData) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPass) {
    console.error(
      "EMAIL_USER or EMAIL_PASSWORD not set in environment variables."
    );
    return { success: false, error: "Missing email credentials." };
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const appDisplayName = "BotScout AI"; // Enhanced App Name
  const logoUrl = "public/mainlogo.svg"; // Replace with actual public image URL (maybe a vibrant one)
  const redirectUrl = "https://botscout-ai.vercel.app/"; // Consider your production URL

  // --- Enhanced renderCard Function ---
  const renderCard = (
    title,
    description,
    linkText,
    linkUrl, // Added linkUrl for more flexibility
    cardType // 'github', 'huggingface', 'arxiv' for specific styling/icons
  ) => {
    let icon = "";
    let borderColor = "#8B5CF6"; // Default purple
    let titleColor = "#C4B5FD"; // Lighter purple for title

    switch (cardType) {
      case "github":
        icon = "💻"; // Or ⭐
        borderColor = "#6D28D9"; // Deep Purple
        titleColor = "#A78BFA";
        break;
      case "huggingface":
        icon = "🤗"; // Or 
        borderColor = "#10B981"; // Emerald Green
        titleColor = "#6EE7B7";
        break;
      case "arxiv":
        icon = "📄"; // Or 🔬
        borderColor = "#3B82F6"; // Vibrant Blue
        titleColor = "#93C5FD";
        break;
    }

    return `
    <div style="background-color: rgba(42, 34, 68, 0.8); /* Dark translucent purple */
                border-left: 4px solid ${borderColor};
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 0 15px ${borderColor}, 0 0 5px ${borderColor};
                transition: transform 0.3s ease, box-shadow 0.3s ease;">
      <h3 style="font-size: 20px; font-weight: bold; color: ${titleColor}; margin-top: 0; margin-bottom: 10px;">
        ${icon} ${title || "Untitled"}
      </h3>
      <p style="font-size: 15px; color: #D1D5DB; margin-bottom: 15px; line-height: 1.6;">
        ${description || "No description available."}
      </p>
      <a href="${linkUrl || redirectUrl}" target="_blank" style="display: inline-block;
                  background: linear-gradient(45deg, ${borderColor}, ${
      cardType === "github"
        ? "#8B5CF6"
        : cardType === "huggingface"
        ? "#34D399"
        : "#60A5FA"
    });
                  color: #FFFFFF;
                  text-decoration: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: bold;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 0 10px ${borderColor}aa;">
        ${linkText} &rarr;
      </a>
    </div>
  `;
  };

  // --- Helper to safely get ArXiv authors ---
  const getArxivAuthors = (authors) => {
    if (!authors) return 'Unknown Authors';
    if (typeof authors === 'string') return authors.slice(0,70) + (authors.length > 70 ? '...' : '');
    if (Array.isArray(authors)) {
      if (authors.length === 0) return 'Unknown Authors';
      // Check if it's an array of strings or array of objects
      if (typeof authors[0] === 'string') {
        return authors.join(', ').slice(0, 70) + (authors.join(', ').length > 70 ? '...' : '');
      }
      if (typeof authors[0] === 'object' && authors[0] !== null && 'name' in authors[0]) {
        return authors.map(a => a.name || 'N/A').join(', ').slice(0, 70) + (authors.map(a => a.name || 'N/A').join(', ').length > 70 ? '...' : '');
      }
    }
    return 'Authors not available in expected format';
  };


  // --- Enhanced htmlContent ---
  const htmlContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #1F2937; /* Dark blue-gray */
              background-image: radial-gradient(circle at top left, rgba(109, 40, 217, 0.3), transparent 50%),
                                radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.3), transparent 50%);
              padding: 40px 20px;
              margin: 0;
              color: #E5E7EB; /* Light gray text */
              min-height: 100vh;
              box-sizing: border-box;">
    <div style="max-width: 700px;
                width: 100%;
                background-color: rgba(31, 41, 55, 0.9); /* Slightly lighter dark, translucent */
                border-radius: 12px;
                box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 15px rgba(20, 184, 166, 0.3);
                overflow: hidden;
                margin: auto;">
      <div style="background: linear-gradient(135deg, #5B21B6 0%, #3B82F6 70%, #10B981 100%);
                  padding: 30px 20px;
                  text-align: center;
                  border-bottom: 3px solid #10B981;">
<h1 style="
  margin: 0;
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #8B5CF6 0%, #10B981 50%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
">
  BotScout AI
</h1>
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #FFFFFF; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
          Your Weekly AI Snapshot
        </h1>
        <p style="font-size: 16px; color: #D1D5DB; margin-top: 8px;">Fueled by ${appDisplayName}</p>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 18px; margin-bottom: 30px; line-height: 1.7; color: #C7D2FE;">
          Here's your electrifying roundup of this week's AI highlights! Dive in and explore the cutting edge:
        </p>

        <h2 style="font-size: 26px; font-weight: bold; color: #A78BFA; /* Purple */
                   margin-top: 30px; margin-bottom: 20px;
                   text-shadow: 0 0 10px #8B5CF6, 0 0 5px #C4B5FD; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">
          🚀 Top GitHub Repositories
        </h2>
        ${
          (allData.github && allData.github.length > 0)
            ? allData.github
                .slice(0, 3) // Showing 3 for brevity, adjust as needed
                .map((repo) =>
                  renderCard(
                    repo.name, // Corrected from repo.full_name based on your data structure
                    repo.description,
                    "Explore Repo",
                    repo.url, // Assuming repo.url is the link to the repo
                    "github"
                  )
                )
                .join("")
            : '<p style="font-size: 16px; color: #9CA3AF; margin-bottom: 20px; padding: 15px; background-color: rgba(55, 65, 81, 0.5); border-radius: 6px;">🌌 No trending GitHub repositories found this week. Stay tuned!</p>'
        }

        <h2 style="font-size: 26px; font-weight: bold; color: #34D399; /* Green */
                   margin-top: 40px; margin-bottom: 20px;
                   text-shadow: 0 0 10px #10B981, 0 0 5px #6EE7B7; border-bottom: 2px solid #10B981; padding-bottom: 10px;">
          💡 Trending Hugging Face Models
        </h2>
        ${
          (allData.huggingface && allData.huggingface.length > 0)
            ? allData.huggingface
                .slice(0, 3)
                .map((model) =>
                  renderCard(
                    model.id,
                    `Model by ${model.author || "Unknown Contributor"}. Downloads: ${model.downloads || 'N/A'}. Likes: ${model.likes || 'N/A'}`,
                    "View Model",
                    `https://huggingface.co/${model.id}`, // Standard Hugging Face model URL
                    "huggingface"
                  )
                )
                .join("")
            : '<p style="font-size: 16px; color: #9CA3AF; margin-bottom: 20px; padding: 15px; background-color: rgba(55, 65, 81, 0.5); border-radius: 6px;">🤖 No trending Hugging Face models found this week. Keep innovating!</p>'
        }

        <h2 style="font-size: 26px; font-weight: bold; color: #60A5FA; /* Blue */
                   margin-top: 40px; margin-bottom: 20px;
                   text-shadow: 0 0 10px #3B82F6, 0 0 5px #93C5FD; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
          📚 Latest ArXiv Papers
        </h2>
        ${
          (allData.arxiv && allData.arxiv.length > 0)
            ? allData.arxiv
                .slice(0, 3)
                .map((paper) =>
                  renderCard(
                    paper.title ? paper.title.replace(/\n/g, " ").trim() : "Untitled Paper",
                    `Authors: ${getArxivAuthors(paper.authors)}`,
                    "Read Paper",
                    paper.url, // Assuming paper.url is the link to the paper (e.g., PDF link or ArXiv page)
                    "arxiv"
                  )
                )
                .join("")
            : '<p style="font-size: 16px; color: #9CA3AF; margin-bottom: 20px; padding: 15px; background-color: rgba(55, 65, 81, 0.5); border-radius: 6px;">🧐 No trending ArXiv papers found this week. The quest for knowledge continues!</p>'
        }

        <p style="font-size: 16px; margin-top: 40px; text-align: center; color: #A5B4FC;">
          Stay ahead of the curve with ${appDisplayName}!
        </p>
      </div>
      <div style="background-color: rgba(17, 24, 39, 0.9); /* Even darker for footer */
                  padding: 20px;
                  text-align: center;
                  font-size: 13px;
                  color: #9CA3AF; /* Muted gray */
                  border-top: 1px solid #374151;">
        <p>&copy; ${new Date().getFullYear()} ${appDisplayName}. All rights reserved.</p>
        <p style="margin-top: 8px;">
          <a href="${redirectUrl}/privacy" style="color: #8B5CF6; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
          <a href="${redirectUrl}/terms" style="color: #8B5CF6; text-decoration: none; margin: 0 8px;">Terms of Service</a> |
          <a href="${redirectUrl}/unsubscribe" style="color: #8B5CF6; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
  `;

  try {
    const subscribersCollection = collection(firestore, "subscribers");
    const subscriberDocs = await getDocs(subscribersCollection);
    const subscribers = subscriberDocs.docs
      .map((doc) => doc.data().email)
      .filter((email) => !!email); // Ensure email is not null or empty

    if (subscribers.length === 0) {
      console.log(
        "No subscribers found in Firestore to send the weekly email to."
      );
      return { success: true, message: "No subscribers found." };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const email of subscribers) {
      try {
        await transporter.sendMail({
          from: `"${appDisplayName}" <${emailUser}>`,
          to: email,
          subject: `⚡ Your Weekly AI Snapshot from ${appDisplayName} is Here!`, // More engaging subject
          html: htmlContent,
        });
        console.log("Weekly AI snapshot email sent to:", email);
        successCount++;
      } catch (error) {
        console.error(
          "Error sending weekly AI snapshot email to:",
          email,
          error
        );
        errorCount++;
        errors.push({ email, error: error.message });
      }
    }

    console.log(
      `Successfully sent ${successCount} emails. Failed to send ${errorCount} emails.`
    );

    if (errors.length > 0) {
      return {
        success: false,
        message: `Failed to send to ${errorCount} subscribers.`,
        errors,
      };
    }

    return {
      success: true,
      message: `Weekly AI snapshot email sent to ${successCount} subscribers.`,
    };
  } catch (error) {
    console.error(
      "Error processing and sending weekly emails (Firestore):",
      error
    );
    return {
      success: false,
      error:
        "An error occurred while processing and sending the weekly emails.",
    };
  }
}
