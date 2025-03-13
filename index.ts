import {
  Client,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
const CHANNEL_ID = process.env.CHANNEL_ID as string;
const GITHUB_FILE_API_URL =
  "https://api.github.com/repos/orwashams/wthr/contents/README.md";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github.v3+json",
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let lastFileSHA: string | null = null;

async function checkForUpdate() {
  try {
    const response = await fetch(GITHUB_FILE_API_URL, {
      headers: GITHUB_HEADERS,
    });
    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }
    const fileData = await response.json();
    const currentSHA = fileData.sha;

    if (lastFileSHA !== currentSHA) {
      lastFileSHA = currentSHA;
      const fileContent = Buffer.from(fileData.content, "base64").toString(
        "utf8",
      );

      const embed = new EmbedBuilder()
        .setTitle("Updated README.md")
        .setDescription(fileContent)
        .setColor(0x0099ff)
        .setTimestamp();

      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel && channel.isTextBased()) {
        const textChannel = channel as TextChannel;
        const messages = await textChannel.messages.fetch({ limit: 100 });
        await textChannel.bulkDelete(messages, true);

        await textChannel.send({ embeds: [embed] });
        console.log("Channel updated with new file content.");
      }
    } else {
      console.log("No changes detected.");
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  checkForUpdate();
  setInterval(checkForUpdate, 60 * 1000);
});

client.login(DISCORD_BOT_TOKEN);
