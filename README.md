# Jimaku Subtitles v2 - Stremio Addon

A lightweight Stremio addon that provides Japanese subtitles for anime from the [Jimaku.cc](https://jimaku.cc) community database.

## ✨ Features

- 🎌 **Japanese subtitles** for anime content
- 🏷️ **Kitsu & OMDb integration** for better content detection

## 🚀 Quick Start

### Using the Hosted Addon

1. **Install Kitsu Addon** (recommended): Search for "Kitsu" in Stremio addons
2. **Get Jimaku API Key**: Sign up at [jimaku.cc](https://jimaku.cc/account)
3. **Add this addon to Stremio** with your API key configured

### Self-Hosting

1. **Clone this repository**
   ```bash
   git clone https://github.com/rotero08/jimaku-subs-stremio.git
   cd jimaku-subs-stremio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Add to Stremio**: `http://localhost:7005/manifest.json`

## ⚙️ Configuration

### Required
- **Jimaku API Key**: Get yours at [jimaku.cc/account](https://jimaku.cc/account) after signing up

### Optional
- **OMDb API Key**: Get free key at [omdbapi.com](https://omdbapi.com) for better movie and non-anime content support

## �🏗️ Deployment

### Deploy to Beamup (Free)

1. **Install Beamup CLI**
   ```bash
   npm install -g beamup-cli
   ```

2. **Deploy**
   ```bash
   beamup
   ```
   - Use host: `a.baby-beamup.club`
   - Provide your GitHub username

3. **Configure in Stremio** using your Beamup URL

## 📋 Requirements

- Node.js 14+ 
- Jimaku.cc API key
- Internet connection for subtitle fetching

## 🙏 Acknowledgments

- [Jimaku.cc](https://jimaku.cc) community for providing subtitle database
- [Kitsu.io](https://kitsu.io) for anime metadata
- [Stremio](https://stremio.com) for the addon platform
- Original repository contributors

---

**Note**: This is an enhanced fork focused on production deployment, improved caching, and better user experience. The original project provided the foundation for Jimaku.cc integration.
