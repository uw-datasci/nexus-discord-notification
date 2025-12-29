# Discord Notification Sender

A reusable GitHub Action that sends Discord notifications for PR preview deployments. This action creates a rich Discord embed with PR information, deployment details, and preview links.

## Features

- 🚀 Sends Discord notifications when preview deployments are ready
- 📋 Displays PR information (number, title, branch, author)
- 🔗 Includes preview deployment link
- 📝 Shows latest commit information (if available)
- 🎨 Beautiful Discord embed with Vercel branding

## Usage

### Basic Example

```yaml
- name: Send Discord Notification
  uses: uw-datasci/nexus-discord-notification@v1
  with:
    discord-webhook-url: ${{ secrets.DISCORD_WEBHOOK_URL }}
    deployment-info: ${{ needs.construct-deployment-url.outputs.deployment-info }}
```

### With Deployment Info from Previous Step

```yaml
- name: Construct Deployment URL
  id: construct-deployment-url
  run: |
    echo "deployment-info={\"url\":\"https://preview.example.com\",\"commitSha\":\"abc123\",\"commitMessage\":\"Fix bug\"}" >> $GITHUB_OUTPUT

- name: Send Discord Notification
  uses: uw-datasci/nexus-discord-notification@v1
  with:
    discord-webhook-url: ${{ secrets.DISCORD_WEBHOOK_URL }}
    deployment-info: ${{ steps.construct-deployment-url.outputs.deployment-info }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `discord-webhook-url` | Discord webhook URL for sending notifications | Yes | - |
| `deployment-info` | JSON string containing deployment information | Yes | - |

### Deployment Info Format

The `deployment-info` input should be a JSON string with the following structure:

```json
{
  "url": "https://preview-deployment.example.com",
  "commitSha": "abc123def456",
  "commitMessage": "Fix: Resolve deployment issue"
}
```

- `url` (required): The preview deployment URL
- `commitSha` (optional): The commit SHA
- `commitMessage` (optional): The commit message

## Setup

### 1. Create a Discord Webhook

1. Go to your Discord server settings
2. Navigate to **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Copy the webhook URL
5. Add it as a secret in your GitHub repository: `DISCORD_WEBHOOK_URL`

### 2. Install the Action

Add this action to your workflow file (e.g., `.github/workflows/deploy.yml`):

```yaml
name: Deploy Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Send Discord Notification
        uses: uw-datasci/nexus-discord-notification@v1
        with:
          discord-webhook-url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          deployment-info: ${{ needs.construct-deployment-url.outputs.deployment-info }}
```

## Project Structure

```
.
├── action.yml              # Action metadata and interface definition
├── src/
│   ├── index.js           # Main entry point for the action
│   └── discord-sender.js  # Discord notification logic
├── dist/                   # Bundled code (generated, do not edit directly)
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Development

### Install Dependencies

```bash
npm install
```

### Build the Action

Before using the action, you need to bundle it:

```bash
npm run build
```

This creates `dist/index.js` which contains all your code and dependencies in a single file.

**Important:** Always commit the `dist/` folder after building, as GitHub Actions runs from the bundled code.

### Run Tests

```bash
npm test
```

## Requirements

- Node.js 20+
- GitHub Actions workflow running on a pull request event
- Discord webhook URL configured as a repository secret

## Discord Embed Preview

The action sends a Discord embed with:

- **Title**: Preview Deployment Ready
- **PR Information**: Number, title, branch, and author
- **Commit Info**: SHA and message (if available)
- **Preview Link**: Direct link to the deployment

## License

MIT
