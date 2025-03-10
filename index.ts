import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
const CHANNEL_ID = process.env.CHANNEL_ID as string;

// Use the correct GitHub API URL for file contents
const GITHUB_FILE_API_URL =
  "https://api.github.com/repos/orwashams/wthr/contents/README.md";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github.v3+json",
  // GitHub API requires a User-Agent header
  "User-Agent": "DiscordBot/1.0.0 (https://your-bot-url.com)",
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  try {
    // Fetch file content from GitHub API
    const response = await fetch(GITHUB_FILE_API_URL, {
      headers: GITHUB_HEADERS,
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    const fileData = await response.json();

    // Decode base64 content
    const fileContent = Buffer.from(fileData.content, "base64").toString(
      "utf8",
    );

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel?.isTextBased()) {
      const textChannel = channel as TextChannel;

      // Clear existing messages
      const messages = await textChannel.messages.fetch({ limit: 100 });
      await textChannel.bulkDelete(messages);

      // Send formatted content
      await textChannel.send(`\`\`\`md\n${fileContent}\n\`\`\``);
    }
  } catch (error) {
    console.error("Error processing the file update:", error);
  }
});

client.login(DISCORD_BOT_TOKEN);
