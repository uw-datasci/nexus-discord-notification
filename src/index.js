import { getInput, setFailed } from "@actions/core";
import { getOctokit, context } from "@actions/github";

import sendDiscordNotification from "./discord-sender.js";

async function run() {
  try {
    // Get inputs defined in action.yml
    const githubToken = getInput("github-token", { required: true });
    const discordWebhookUrl = getInput("discord-webhook-url", {
      required: true,
    });
    const deploymentInfoJson = getInput("deployment-info", { required: true });

    // Parse deployment info JSON
    let deploymentInfo;
    try {
      deploymentInfo = JSON.parse(deploymentInfoJson);
    } catch (error) {
      setFailed(`Failed to parse deployment-info JSON: ${error.message}`);
      return;
    }

    // Set environment variable for Discord webhook URL
    process.env.DISCORD_WEBHOOK_URL = discordWebhookUrl;

    // Create GitHub API client
    const github = getOctokit(githubToken);

    // Create core object with required methods
    // Note: discord-sender.js calls core.setFailed() and then returns,
    // so we just need to map it to the action's setFailed function
    const core = { setFailed: setFailed };

    // Call the sendDiscordNotification function from discord-sender
    await sendDiscordNotification(core, github, context, deploymentInfo);
  } catch (error) {
    setFailed(`Action failed: ${error.message}`);
  }
}

await run();
