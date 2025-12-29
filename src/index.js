import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";

import sendDiscordNotification from "./discord-sender.js";

async function run() {
  try {
    // Get inputs defined in action.yml
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

    // Create core object with required methods
    // Note: discord-sender.js calls core.setFailed() and then returns,
    // so we just need to map it to the action's setFailed function
    const core = { setFailed: setFailed };

    // Call the sendDiscordNotification function from discord-sender
    // Pass webhook URL directly as parameter (more secure than process.env)
    await sendDiscordNotification(
      core,
      context,
      deploymentInfo,
      discordWebhookUrl
    );
  } catch (error) {
    setFailed(`Action failed: ${error.message}`);
  }
}

await run();
