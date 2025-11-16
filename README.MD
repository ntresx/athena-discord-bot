```markdown
# 🌌 Athena Discord Bot
Athena is a powerful multi-purpose Discord bot built using Node.js & discord.js v14.  
This bot includes a full moderation system, warnings, auto-mute, rules manager, and a status announcement embed on startup.

---

## 🚀 Features

### 🔧 Moderation Tools
- /warn add – Add a warning to a user  
- /warn check – Check warnings  
- /warn reset – Reset user's warnings  
- /warn list – Display all warned users  

### ⚠️ Auto Warning System
Athena detects toxic words automatically
```

```
If a user reaches:
- 3 warnings → Auto mute (1 hour)
- Auto unmute after mute duration

### 📝 Rules Manager
- /rules update – Update server rules  
- /rules send – Send rules into the rules channel  
- Accepts multi-line input using \n or |

### 📢 Startup Status Embed
Every time the bot turns on, it sends an embed:
- Ping  
- Uptime  
- Server count  
- Bot avatar  
- Cool intro text:  
  “✨ A GOD HAS ARRIVED! Athena has joined the server!”

### 🔒 Manual Mute Commands
- !mute @user 10m | 1h | 1d
- !unmute @user

---

## 📁 Project Structure
```
athena-discord-bot/
│
├── src/
│   ├── bot.js
│   └── utils/
│
├── config.example.json
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

---

## ⚙️ Setup

### 1️⃣ Install Dependencies
```
npm install
```

### 2️⃣ Create Your Own config.json
Copy config.example.json then rename it to:
```
config.json
```

Fill it with your values:
```json
{
  "token": "YOUR_BOT_TOKEN",
  "webhookURL": "WEBHOOK_URL",
  "ownerId": "YOUR_ID",
  "applicationId": "YOUR_APPLICATION_ID",
  "rulesChannelId": "RULES_CHANNEL_ID",
  "warningChannelId": "WARNING_CHANNEL_ID",
  "statusChannelId": "STATUS_CHANNEL_ID"
}
```

> ⚠️ **Never upload config.json!**  
It is ignored by .gitignore for safety.

---

## 🏃 Run the Bot
```
node src/bot.js
```

---

## 🛡️ Requirements
- Node.js v18+
- Discord Bot Token  
- Proper channel IDs for rules, warnings, and status

---

## 🤝 Contributing
Pull requests are welcome!  
Feel free to fork this repo and improve Athena.

---

## 📜 License
This project is licensed under the MIT License — free to use, modify, and distribute.

---

## ⭐ Support the Project
If you like Athena, consider giving the repo a star ⭐ on GitHub!
```

