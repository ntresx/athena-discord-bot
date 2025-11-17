// =========================
// IMPORTS
// =========================
const {
  Client,
  GatewayIntentBits,
  WebhookClient,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");

// =========================
// LOAD CONFIG
// =========================
const config = require("./config.json");
const {
  token,
  webhookURL,
  warningChannelId,
  rulesChannelId,
  applicationId,
  statusChannelId,
  ownerId,
} = config;

// =========================
// ERROR HANDLING → DM OWNER
// =========================
process.on("unhandledRejection", async (err) => {
  console.error("UnhandledRejection:", err);
  try {
    const owner = await client.users.fetch(ownerId);
    owner.send(`⚠️ **Unhandled Rejection:**\n\`\`\`${err}\`\`\``);
  } catch {}
});
process.on("uncaughtException", async (err) => {
  console.error("UncaughtException:", err);
  try {
    const owner = await client.users.fetch(ownerId);
    owner.send(`🔥 **Uncaught Exception:**\n\`\`\`${err}\`\`\``);
  } catch {}
});

// =========================
// LOAD WARNINGS
// =========================
let warnings = require("./warnings.json");
function saveWarnings() {
  fs.writeFileSync(
    __dirname + "/warnings.json",
    JSON.stringify(warnings, null, 2)
  );
}

// =========================
// LOAD RULES
// =========================
let rules = require("./rules.json").rules;

// =========================
// INIT WEBHOOK (Optional)
// =========================
let webhook = null;
try {
  webhook = new WebhookClient({ url: webhookURL });
} catch (e) {
  console.log("Webhook error:", e.message);
}

// =========================
// CLIENT INIT
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// =========================
// SLASH COMMAND DEFINITIONS
// =========================
const commands = [
  // RULES COMMAND
  new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Manage rules server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("update")
        .setDescription("Update the server rules content")
        .addStringOption((o) =>
          o
            .setName("content")
            .setDescription("Rules content (use \\n or | for enter)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("send").setDescription("Send rules to rules channel")
    )
    .toJSON(),

  // WARNING SYSTEM
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warning system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a warning to user")
        .addUserOption((o) =>
          o
            .setName("target")
            .setDescription("user who wants to be warned")
            .setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("reason").setDescription("Warning reasons").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("check")
        .setDescription("Check user warning")
        .addUserOption((o) =>
          o
            .setName("target")
            .setDescription("User that you want to check")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription("Reset warning user")
        .addUserOption((o) =>
          o
            .setName("target")
            .setDescription("User that you want to reset")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List all user that have warnings")
    )
    .toJSON(),

  // STATUS COMMAND
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check status bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON(),
];

// =========================
// REGISTER SLASH COMMANDS
// =========================
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Mengupload slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(applicationId, "1234567890"), // <=== SERVER ID
      { body: commands }
    );
    console.log("Slash commands uploaded!");
  } catch (error) {
    console.error(error);
  }
})();

// =========================
// READY EVENT
// =========================
client.on("ready", async () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  const statusChannel = client.channels.cache.get(statusChannelId);
  if (!statusChannel) return console.log("Status channel tidak ditemukan!");

  // Ping
  const ping = Math.round(client.ws.ping);

  // Uptime
  const totalSeconds = client.uptime / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const uptime = `${hours}h ${minutes}m ${seconds}s`;

  // Servers
  const serverCount = client.guilds.cache.size;

  const embed = {
    color: 0x9b59b6,
    title: "✨ A GOD HAS ARRIVED!",
    description: `**${client.user.username}** has joined the server!`,
    thumbnail: { url: client.user.displayAvatarURL({ size: 1024 }) },
    fields: [
      { name: "⚡ Ping", value: `\`${ping}ms\``, inline: true },
      { name: "🕒 Uptime", value: `\`${uptime}\``, inline: true },
      { name: "🌍 Servers", value: `\`${serverCount}\``, inline: true },
    ],
    timestamp: new Date(),
    footer: {
      text: `${client.user.username} • Online`,
      icon_url: client.user.displayAvatarURL(),
    },
  };

  statusChannel.send({ embeds: [embed] });
});

// =========================
// AUTO UPDATE STATUS TIAP 10 MENIT
// =========================
setInterval(() => {
  const channel = client.channels.cache.get(statusChannelId);
  if (!channel) return;

  const ping = Math.round(client.ws.ping);
  const uptimeSec = client.uptime / 1000;
  const h = Math.floor(uptimeSec / 3600);
  const m = Math.floor((uptimeSec % 3600) / 60);

  const embed = {
    color: 0x2ecc71,
    title: "🔄 Bot Status Update",
    description: `**${client.user.username}** masih berjalan normal.`,
    fields: [
      { name: "⚡ Ping", value: `\`${ping}ms\``, inline: true },
      { name: "🕒 Uptime", value: `\`${h}h ${m}m\``, inline: true },
      {
        name: "🌍 Servers",
        value: `\`${client.guilds.cache.size}\``,
        inline: true,
      },
    ],
    timestamp: new Date(),
  };

  channel.send({ embeds: [embed] });
}, 10 * 60 * 1000);

// =========================
// SHUTDOWN ALERT
// =========================
process.on("beforeExit", () => {
  const channel = client.channels.cache.get(statusChannelId);
  if (channel) {
    channel.send("🔴 **Bot is shutting down...**");
  }
});

// =========================
// AUTO WARNING SYSTEM
// =========================
async function addWarning(user, guild, reason) {
  if (!warnings[user.id]) warnings[user.id] = { count: 0 };
  warnings[user.id].count += 1;
  saveWarnings();

  const warnChan = guild.channels.cache.get(warningChannelId);
  if (warnChan) {
    warnChan.send(
      `⚠️ **Warning Baru!**\n**User:** ${user.tag}\n**Total Warning:** ${
        warnings[user.id].count
      }\n**Alasan:** ${reason}`
    );
  }

  if (warnings[user.id].count >= 3) {
    const muteRole = guild.roles.cache.find((r) => r.name === "Muted");
    const member = guild.members.cache.get(user.id);

    if (muteRole && member) {
      await member.roles.add(muteRole);

      warnChan.send(`🔇 **${user.tag}** otomatis di-mute 1 jam!`);

      setTimeout(async () => {
        await member.roles.remove(muteRole);
        warnChan.send(`🔊 **${user.tag}** otomatis di-unmute!`);
      }, 1 * 60 * 60 * 1000);
    }
  }
}

// =========================
// PARSE DURATION
// =========================
function parseDuration(str) {
  const num = parseInt(str);
  if (str.endsWith("m")) return num * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return null;
}

// =========================
// MESSAGE EVENTS
// =========================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  const args = message.content.split(" ");

  // KATA KASAR
  const badWords = ["anjing", "bangsat", "kontol", "memek"];
  if (badWords.some((w) => msg.includes(w))) {
    message.delete();
    message.channel.send(`${message.author}, kata kasar tidak boleh!`);
    addWarning(message.author, message.guild, "Kata kasar");
  }

  // !mute
  if (args[0] === "!mute") {
    const user = message.mentions.members.first();
    const duration = parseDuration(args[2]);
    const muteRole = message.guild.roles.cache.find((r) => r.name === "Muted");

    if (!user || !duration || !muteRole) return message.reply("Format salah.");

    await user.roles.add(muteRole);
    message.channel.send(`🔇 ${user.user.tag} di-mute ${args[2]}!`);

    setTimeout(async () => {
      await user.roles.remove(muteRole);
      message.channel.send(`🔊 ${user.user.tag} otomatis di-unmute!`);
    }, duration);
  }

  // !unmute
  if (args[0] === "!unmute") {
    const user = message.mentions.members.first();
    const muteRole = message.guild.roles.cache.find((r) => r.name === "Muted");

    await user.roles.remove(muteRole);
    message.channel.send(`🔊 ${user.user.tag} sudah di-unmute.`);
  }
});

// =========================
// INTERACTION HANDLER
// =========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // STATUS COMMAND
  if (interaction.commandName === "status") {
    await interaction.deferReply({ ephemeral: false });

    const ping = Math.round(client.ws.ping);
    const uptimeSec = client.uptime / 1000;
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const uptime = `${h}h ${m}m ${s}s`;

    const memory = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const cpuUsage = process.cpuUsage();
    const cpu = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

    const embed = {
      color: 0x3498db,
      title: "📊 Bot Status",
      fields: [
        { name: "⚡ Ping", value: `\`${ping}ms\``, inline: true },
        { name: "🕒 Uptime", value: `\`${uptime}\``, inline: true },
        { name: "💾 Memory", value: `\`${memory} MB\``, inline: true },
        { name: "🧠 CPU", value: `\`${cpu}%\``, inline: true },
        {
          name: "🌍 Servers",
          value: `\`${client.guilds.cache.size}\``,
          inline: true,
        },
      ],
      timestamp: new Date(),
    };

    return interaction.editReply({ embeds: [embed] });
  }

  // RULES
  if (interaction.commandName === "rules") {
    const sub = interaction.options.getSubcommand();
    const rulesChannel = interaction.guild.channels.cache.get(rulesChannelId);

    // UPDATE RULES
    if (sub === "update") {
      await interaction.deferReply({ ephemeral: true });

      let newRules = interaction.options.getString("content");
      newRules = newRules.replace(/\\n/g, "\n").replace(/\|/g, "\n");

      fs.writeFileSync(
        __dirname + "/rules.json",
        JSON.stringify({ rules: newRules }, null, 2)
      );
      rules = newRules;

      return interaction.editReply("✅ rules successfully updated");
    }

    // SEND RULES
    if (sub === "send") {
      await interaction.deferReply({ ephemeral: true });
      await rulesChannel.send(`\`\`\`\n${rules}\n\`\`\``);
      return interaction.editReply("📜 Rules berhasil dikirim!");
    }
  }

  // WARNING SYSTEM
  if (interaction.commandName === "warn") {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    await interaction.deferReply({ ephemeral: true });

    if (sub === "add") {
      await addWarning(target, interaction.guild, reason);
      return interaction.editReply(
        `⚠️ ${target.tag} diberi warning. Total: **${
          warnings[target.id].count
        }**`
      );
    }

    if (sub === "check") {
      const count = warnings[target.id]?.count || 0;
      return interaction.editReply(
        `📝 ${target.tag} memiliki **${count} warning**.`
      );
    }

    if (sub === "reset") {
      warnings[target.id] = { count: 0 };
      saveWarnings();
      return interaction.editReply(
        `♻️ Warning ${target.tag} berhasil direset.`
      );
    }

    if (sub === "list") {
      let txt = "📄 **List Warning User:**\n\n";
      const entries = Object.entries(warnings);
      if (entries.length === 0)
        return interaction.editReply("Tidak ada user yang punya warning.");

      for (const [id, data] of entries) {
        const user = await client.users.fetch(id).catch(() => null);
        if (!user) continue;
        txt += `• **${user.tag}** — ${data.count} warning\n`;
      }

      return interaction.editReply(txt);
    }
  }
});

// =========================
// LOGIN
// =========================
client.login(token);
