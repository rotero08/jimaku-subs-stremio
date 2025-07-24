# Jimaku Subtitles v2 - Stremio Addon

A Stremio addon that provides Japanese subtitles for anime from the [Jimaku.cc](https://jimaku.cc) community database. This is an enhanced fork with improved subtitle caching, cloud deployment support, and better user experience.

## ✨ Features

- 🎌 **Japanese subtitles** for anime content
- 🔄 **Automatic ASS to SRT conversion** when needed
- 🏷️ **Kitsu & IMDb integration** for better content detection
- ⚡ **Smart caching** (20-minute duration optimized for anime episodes)
- ☁️ **Cloud-ready** with no local file dependencies
- 🎯 **Episode-specific** subtitle detection

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

## 🎯 How It Works

1. **Content Detection**: Identifies anime through Kitsu IDs or IMDb metadata
2. **Subtitle Search**: Queries Jimaku.cc database using anime titles (Japanese preferred)
3. **Format Handling**: Serves SRT files directly or converts ASS files to SRT in-memory
4. **Smart Caching**: Keeps subtitles available during viewing, cleans up when switching content

## 🏗️ Deployment

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

### Environment Variables

- `PORT`: Server port (default: 7005)
- `NODE_ENV`: Environment mode
- `BASE_URL`: Base URL for production deployment

## 🔧 API Endpoints

- `GET /manifest.json` - Addon manifest
- `GET /configure` - Configuration interface
- `GET /subtitles/{type}/{id}.json` - Subtitle requests
- `GET /converted/{id}` - Converted subtitle files

## 📝 Changelog

### v2.0.0 - Enhanced Fork
- ✅ **Improved caching strategy**: Content-aware cleanup instead of time-based
- ✅ **Cloud deployment ready**: No local file storage dependencies
- ✅ **Better error handling**: Graceful fallbacks and logging
- ✅ **Enhanced configuration**: Clear setup instructions and API key management
- ✅ **Memory optimization**: Smart cleanup when switching content
- ✅ **Production optimizations**: 20-minute cache duration for anime episodes

### Original Features
- Basic Japanese subtitle fetching from Jimaku.cc
- ASS to SRT conversion
- Kitsu integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📋 Requirements

- Node.js 14+ 
- Jimaku.cc API key
- Internet connection for subtitle fetching

## 🐛 Troubleshooting

### Common Issues

**No subtitles found:**
- Ensure your Jimaku API key is valid
- Check if the anime exists on Jimaku.cc
- Try using Kitsu addon for better content detection

**Subtitles not updating between episodes:**
- Wait up to 20 minutes for cache to refresh
- Restart the addon if self-hosting

**Conversion errors:**
- Check server logs for ASS conversion issues
- Ensure stable internet connection

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Jimaku.cc](https://jimaku.cc) community for providing subtitle database
- [Kitsu.io](https://kitsu.io) for anime metadata
- [Stremio](https://stremio.com) for the addon platform
- Original repository contributors

---

**Note**: This is an enhanced fork focused on production deployment, improved caching, and better user experience. The original project provided the foundation for Jimaku.cc integration.
