/**
 * Discord Notification Sender - Sends Discord notifications for PR deployments
 */

/**
 * Creates a rich Discord embed for preview deployment
 * @param {Object} prInfo - PR information
 * @param {Object} deploymentInfo - Deployment information
 * @returns {Object} Discord embed object
 */
function createDiscordEmbed(prInfo, deploymentInfo) {
  const embed = {
    title: "🚀 Preview Deployment Ready",
    description: `**${prInfo.title}**`,
    color: 0x00d4aa, // Vercel green
    fields: [
      {
        name: "📋 Pull Request",
        value: `[#${prInfo.number}](${prInfo.url})`,
        inline: true,
      },
      {
        name: "🌿 Branch",
        value: `\`${prInfo.branchName}\``,
        inline: true,
      },
      {
        name: "👤 Author",
        value: `@${prInfo.author}`,
        inline: true,
      },
    ],
    author: {
      name: prInfo.author,
      icon_url: prInfo.authorAvatar,
    },
    timestamp: new Date().toISOString(),
    footer: {
      text: "Vercel Preview Deployment",
      icon_url: "https://vercel.com/favicon.ico",
    },
  };

  // Add commit info if available
  if (deploymentInfo.commitMessage && deploymentInfo.commitSha) {
    embed.fields.push({
      name: "📝 Latest Commit",
      value: `\`${deploymentInfo.commitSha}\` ${deploymentInfo.commitMessage}`,
      inline: false,
    });
  }

  // Add deployment link
  embed.fields.push({
    name: "🔗 Preview Link",
    value: `[View Deployment](${deploymentInfo.url})`,
    inline: false,
  });

  return embed;
}

/**
 * Sends Discord notification for preview deployment
 * @param {Object} core - GitHub Actions core
 * @param {Object} context - GitHub context (contains PR info)
 * @param {Object} deploymentInfo - Deployment information from URL constructor
 * @param {string} webhookUrl - Discord webhook URL (passed directly for security)
 * @returns {Promise<void>}
 */
async function sendDiscordNotification(
  core,
  context,
  deploymentInfo,
  webhookUrl
) {
  try {
    console.log("🚀 Sending Discord notification...");

    // Extract PR info directly from context
    const pr = context.payload.pull_request;
    if (!pr) {
      core.setFailed("❌ No PR found in context");
      return;
    }

    const prInfo = {
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      author: pr.user.login,
      authorAvatar: pr.user.avatar_url,
      branchName: pr.head.ref,
    };

    console.log("PR Info:", JSON.stringify(prInfo, null, 2));
    console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

    // Validate webhook URL
    if (!webhookUrl) {
      core.setFailed("❌ Discord webhook URL is not provided");
      return;
    }

    // Create Discord embed
    const embed = createDiscordEmbed(prInfo, deploymentInfo);
    const payload = {
      embeds: [embed],
    };

    console.log("Sending Discord notification...");

    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Discord webhook failed (${response.status}): ${errorText}`
      );
    }

    console.log("✅ Discord notification sent successfully!");
  } catch (error) {
    console.error("❌ Error sending Discord notification:", error);
    // Don't include error details that might leak the webhook URL
    const safeErrorMessage = error.message || "Unknown error occurred";
    core.setFailed(`Failed to send Discord notification: ${safeErrorMessage}`);
  }
}

export default sendDiscordNotification;
