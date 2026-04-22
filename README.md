# AutoPromo-CommunityEdition

**AutoPromo Community Edition** is a free, open-source automation suite for social media engagement and outreach. Run locally on your machine to automate Twitter and Telegram activities with full control over your data and configuration.

## Features

- **Twitter Automation**: Automate likes, retweets, follows, and replies based on target keywords with customizable rate-limiting
- **Telegram Auto-DM**: Scrape group members and run automated outreach campaigns with spintax support
- **AI Integration**: Bring your own AI API keys (OpenAI, Anthropic, Google Gemini) for human-like auto-replies
- **Local-First**: Everything runs locally on your machine - your data stays with you
- **Windows Desktop**: Build as a standalone Windows executable using Electron

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Parmasanandgarlic/AutoPromo-CommunityEdition.git
cd AutoPromo-CommunityEdition
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example environment file and add your API keys:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Windows

To create a standalone Windows executable:

```bash
npm run electron:build:win
```

The built executable will be in the `release/` directory.

## Configuration

Edit the `.env` file to configure:
- Twitter API credentials
- Telegram bot token
- AI provider API keys (OpenAI, Anthropic, or Google Gemini)
- Rate limits and scraping settings

## License

This project is open-source and available under the MIT License.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Disclaimer

This tool is for educational purposes and personal use. Always comply with the terms of service of the platforms you automate and respect rate limits to avoid account restrictions. 
