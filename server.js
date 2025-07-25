const bent = require("bent");
const { convertAssToSrtFromUrl } = require("./getSubtitle.js");
const { getConfigurePage } = require("./configure.js");
const { publishToCentral } = require("stremio-addon-sdk");
const express = require("express");
const path = require("path");

// Get the port from environment or default to 7005
const PORT = process.env.PORT || 7006;

// Determine the base URL - handle Beamup deployment correctly
let baseUrl;
if (process.env.BASE_URL) {
    // Explicit BASE_URL set
    baseUrl = process.env.BASE_URL;
} else if (process.env.NODE_ENV === 'production') {
    // Auto-detect Beamup URL - use your actual deployment URL
    baseUrl = `https://56bf09e9ba27-jimaku-subs-stremiov2.baby-beamup.club`;
} else {
    // Development
    baseUrl = `http://localhost:${PORT}`;
}

const getKitsuJSON = bent("https://kitsu.io/api/edge/", "GET", "json", {
	Accept: "application/vnd.api+json",
	"Content-Type": "application/vnd.api+json",
});
const getJimakuIDJSONSetup = (apiKey) =>
	bent("https://jimaku.cc/api/", "GET", "json", {
		Authorization: apiKey,
	});
const getOMDbJSONSetup = (apiKey) =>
	bent(`https://www.omdbapi.com/?apikey=${apiKey}&`, "GET", "json");

// Icon URL as constant to avoid any encoding issues - back to jsdelivr CDN which works
const ICON_URL = "https://cdn.jsdelivr.net/gh/rotero08/jimaku-subs-stremiov2/icon.png";

const manifest = {
	id: "community.jimakusub.v2",
	version: "2.0.0",
	catalogs: [],
	resources: ["subtitles"],
	types: ["movie", "series"],
	idPrefixes: ["tt", "kitsu"],  // Support both IMDB and Kitsu IDs
	name: "Jimaku Subtitles v2",
	description: "Get Japanese subtitles for anime from Jimaku.cc community database. Works best with Kitsu anime addon for proper anime detection and metadata.",
	icon: ICON_URL,
	behaviorHints: {
		configurable: true,
		configurationRequired: true,
	}
};

// In-memory storage for converted subtitles
const convertedSubtitles = new Map();
let currentContent = null;

// Express app setup
const app = express();

// CORS middleware
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
		return;
	}
	
	next();
});

// Cache middleware
app.use((req, res, next) => {
	if (req.path.includes('/manifest.json') || req.path.includes('/subtitles/')) {
		res.header('Cache-Control', 'public, max-age=1200');
	}
	next();
});

// Base manifest endpoint (configurable)
app.get('/manifest.json', (req, res) => {
	console.log(`📜 Base manifest request received`);
	console.log(`� Returning configurable manifest`);
	res.json(manifest);
});

// User-configured manifest endpoint
app.get('/:userConfig/manifest.json', (req, res) => {
	try {
		const config = JSON.parse(Buffer.from(req.params.userConfig, 'base64').toString());
		
		global.userConfigs = global.userConfigs || new Map();
		global.userConfigs.set(req.params.userConfig, config);
		
		const configuredManifest = {
			...manifest,
			id: `${manifest.id}.${req.params.userConfig.substring(0, 8)}`,
			name: `${manifest.name}`,
			description: manifest.description.replace('/configure', `/${req.params.userConfig}/configure`),
			behaviorHints: {
				configurable: true,
				configurationRequired: false
			}
		};
		
		res.json(configuredManifest);
	} catch (error) {
		console.error('❌ Error parsing config:', error.message);
		res.status(400).json({ error: 'Invalid config' });
	}
});

// Base subtitles endpoint
app.get('/subtitles/:type/:id*.json', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	
	res.status(200).json({ subtitles: [] });
});

// User-configured subtitles endpoint
app.get('/:userConfig/subtitles/:type/:id*.json', async (req, res) => {
	const { userConfig, type } = req.params;
	
	let rawId = req.params.id + (req.params[0] || '');
	let id = rawId.split('/videoHash=')[0].split('?')[0].split('&')[0];
	id = decodeURIComponent(id);
	
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	
	try {
		global.userConfigs = global.userConfigs || new Map();
		let config = global.userConfigs.get(userConfig);
		
		if (!config) {
			try {
				config = JSON.parse(Buffer.from(userConfig, 'base64').toString());
				global.userConfigs.set(userConfig, config);
			} catch (decodeError) {
				console.error('❌ Could not decode config:', decodeError.message);
				return res.status(200).json({ subtitles: [] });
			}
		}
		
		const subtitles = await Promise.race([
			handleSubtitleRequest(type, id, config, userConfig),
			new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
			)
		]);
		
		res.status(200).json({ subtitles });
	} catch (error) {
		console.error('❌ Error handling subtitle request:', error.message);
		res.status(200).json({ subtitles: [] });
	}
});

// Subtitle handler function
async function handleSubtitleRequest(type, id, config, userConfig = 'default') {
	const contentKey = `${type}-${id}`;
	
	if (currentContent && currentContent !== contentKey) {
		convertedSubtitles.clear();
	}
	currentContent = contentKey;
	
	const jimakuApiKey = config.jimakuApiKey;
	const OMDbApiKey = config.OMDbApiKey || config.omdbApiKey;
	
	if (!jimakuApiKey) {
		return [];
	}
	
	const getJimakuIDJSON = getJimakuIDJSONSetup(jimakuApiKey);
	const getOMDbJSON = OMDbApiKey ? getOMDbJSONSetup(OMDbApiKey) : null;
	
	let apiTitle;
	let episode;
	let apiId;
	let isAnime;
	let fallbackApiTitle;

	try {
		if (id.startsWith("kitsu:")) {
			const idParts = id.split(":");
			episode = type === "series" ? parseInt(idParts[2]) || 0 : 0;
			apiId = idParts[1];
			const urlKitsu = `anime/${apiId}`;
			
			try {
				const kitsuData = await getKitsuJSON(urlKitsu);
				
				if (!kitsuData || !kitsuData.data || !kitsuData.data.attributes) {
					throw new Error("Invalid Kitsu API response structure");
				}
				
				if (kitsuData.data.attributes.titles && kitsuData.data.attributes.titles.ja_jp) {
					apiTitle = kitsuData.data.attributes.titles.ja_jp;
					fallbackApiTitle = kitsuData.data.attributes.canonicalTitle;
				} else {
					apiTitle = kitsuData.data.attributes.canonicalTitle;
				}
				isAnime = true;
			} catch (kitsuError) {
				console.error(`❌ Kitsu API error for ${apiId}:`, kitsuError.message);
				return [];
			}
		} else if (id.startsWith("tt")) {
			const idParts = id.split(":");
			episode = type === "series" ? parseInt(idParts[2]) || 0 : 0;
			apiId = idParts[0];
			
			if (getOMDbJSON) {
				const urlOMDb = `i=${apiId}`;
				
				try {
					const OMDbdata = await getOMDbJSON(urlOMDb);
					
					if (!OMDbdata || OMDbdata.Response === "False") {
						throw new Error(OMDbdata.Error || "OMDb API returned false response");
					}

					apiTitle = OMDbdata.Title;
					
					if (OMDbdata.Genre && OMDbdata.Genre.includes("Animation")) {
						isAnime = true;
					} else {
						isAnime = false;
					}
				} catch (omdbError) {
					console.error(`❌ OMDb API error for ${apiId}:`, omdbError.message);
					apiTitle = `IMDb-${apiId}`;
					isAnime = false;
				}
			} else {
				apiTitle = `IMDb-${apiId}`;
				isAnime = false;
			}
		} else {
			return [];
		}
		
		if (!apiTitle) {
			return [];
		}

		let encodedTitle = encodeURIComponent(apiTitle);
		let urlJimakuID = `entries/search?query=${encodedTitle}`;
		if (!isAnime) {
			urlJimakuID = `${urlJimakuID}&anime=false`;
		}
		
		let jimakuData;
		let jimakuID;
		
		try {
			jimakuData = await getJimakuIDJSON(urlJimakuID);
			if (!Array.isArray(jimakuData)) {
				throw new Error("Jimaku API returned non-array response");
			}
			jimakuID = jimakuData[0]?.id;
		} catch (jimakuError) {
			console.error(`❌ Jimaku search error for "${apiTitle}":`, jimakuError.message);
			if (jimakuError.statusCode === 401 || jimakuError.statusCode === 403) {
				console.error(`❌ Jimaku API authentication failed - check API key`);
			}
			return [];
		}

		if (!jimakuID) {
			if (fallbackApiTitle) {
				encodedTitle = encodeURIComponent(fallbackApiTitle);
				urlJimakuID = `entries/search?query=${encodedTitle}`;
				if (!isAnime) {
					urlJimakuID = `${urlJimakuID}&anime=false`;
				}
				
				try {
					jimakuData = await getJimakuIDJSON(urlJimakuID);
					if (!Array.isArray(jimakuData)) {
						throw new Error("Jimaku API returned non-array response");
					}
					jimakuID = jimakuData[0]?.id;
				} catch (fallbackError) {
					console.error(`❌ Fallback Jimaku search error:`, fallbackError.message);
					return [];
				}
				
				if (!jimakuID) {
					return [];
				}
			} else {
				return [];
			}
		}

		const urlJimakuFiles =
			episode === 0
				? `entries/${jimakuID}/files`
				: `entries/${jimakuID}/files?episode=${episode}`;
		
		let subtitleFiles;
		try {
			subtitleFiles = await getJimakuIDJSON(urlJimakuFiles);
			if (!Array.isArray(subtitleFiles)) {
				throw new Error("Jimaku files API returned non-array response");
			}
		} catch (filesError) {
			console.error(`❌ Jimaku files error for ID ${jimakuID}:`, filesError.message);
			return [];
		}

		if (subtitleFiles.length > 0) {
			// First, look for SRT files
			const srtFiles = subtitleFiles.filter((file) => file.name.endsWith(".srt"));
			
			if (srtFiles.length > 0) {
				const subtitles = srtFiles.map((file) => ({
					id: file.name,
					url: file.url,
					lang: "jpn",
				}));
				return subtitles;
			}

			// If no SRT files, convert ASS files
			const assFiles = subtitleFiles.filter((file) => file.name.endsWith(".ass"));
			
			if (assFiles.length > 0) {
				const assSubtitles = await Promise.all(
					assFiles.map(async (file) => {
						try {
							const srtContent = await convertAssToSrtFromUrl(file.url);
							
							const contentHash = file.url.split('/').pop().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
							const conversionId = `${jimakuID}-ep${episode}-${contentHash}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
							
							const filename = file.name.replace(".ass", "[convertedToSrt].srt");
							convertedSubtitles.set(conversionId, {
								content: srtContent,
								filename: filename,
								jimakuID: jimakuID,
								episode: episode
							});
							
							return {
								id: filename,
								url: `${baseUrl}/${userConfig}/converted/${conversionId}`,
								lang: "jpn",
							};
						} catch (error) {
							console.error(`❌ Failed to convert ${file.name}:`, error.message);
							return null;
						}
					})
				);
				
				const validSubtitles = assSubtitles.filter(sub => sub !== null);
				
				if (validSubtitles.length > 0) {
					return validSubtitles;
				}
			}
			
			return [];
		} else {
			return [];
		}
	} catch (error) {
		console.error("❌ Error handling subtitle request:", error.message);
		return [];
	}
}

// Converted subtitles endpoint
app.get("/converted/:id", async (req, res) => {
	const { id } = req.params;
	
	if (convertedSubtitles.has(id)) {
		const subtitleData = convertedSubtitles.get(id);
		
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Content-Disposition', `attachment; filename="${subtitleData.filename}"`);
		res.send(subtitleData.content);
	} else {
		res.status(404).json({ error: "Subtitle not found" });
	}
});

// User-configured converted subtitles endpoint
app.get("/:userConfig/converted/:id", async (req, res) => {
	const { id } = req.params;
	
	if (convertedSubtitles.has(id)) {
		const subtitleData = convertedSubtitles.get(id);
		
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Content-Disposition', `attachment; filename="${subtitleData.filename}"`);
		res.send(subtitleData.content);
	} else {
		res.status(404).json({ error: "Subtitle not found" });
	}
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve icon.png file
app.get('/icon.png', (req, res) => {
	res.setHeader('Content-Type', 'image/png');
	res.sendFile('icon.png', { root: __dirname }, (err) => {
		if (err) {
			console.error('Error serving icon:', err);
			res.status(404).send('Icon not found');
		}
	});
});

// Dark mode configure page (base)
app.get('/configure', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getConfigurePage(ICON_URL));
});

// Dark mode configure page (user-configured path)
app.get('/:userConfig/configure', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getConfigurePage(ICON_URL));
});

// API validation endpoints
app.get('/validate-jimaku', async (req, res) => {
	const apiKey = req.query.apikey;
	
	if (!apiKey) {
		return res.json({ valid: false, error: 'API key is required' });
	}
	
	try {
		const getJimakuJSON = getJimakuIDJSONSetup(apiKey);
		const response = await getJimakuJSON('entries/search?anime=true');
		
		if (Array.isArray(response)) {
			res.json({ valid: true, message: 'Jimaku API key is valid' });
		} else {
			throw new Error('Unexpected response format');
		}
		
	} catch (error) {
		if (error.statusCode === 401 || error.statusCode === 403) {
			res.json({ valid: false, error: 'Invalid or unauthorized Jimaku API key' });
		} else if (error.statusCode === 429) {
			res.json({ valid: false, error: 'Rate limit exceeded, but API key appears valid' });
		} else {
			res.json({ valid: false, error: 'Invalid Jimaku API key' });
		}
	}
});

app.get('/validate-omdb', async (req, res) => {
	const apiKey = req.query.apikey;
	
	if (!apiKey) {
		return res.json({ valid: false, error: 'API key is required' });
	}
	
	try {
		const getOMDbJSON = getOMDbJSONSetup(apiKey);
		const response = await getOMDbJSON('i=tt0111161');
		
		if (response.Response === 'False' && response.Error === 'Invalid API key!') {
			throw new Error('Invalid API key');
		}
		
		res.json({ valid: true, message: 'OMDb API key is valid' });
		
	} catch (error) {
		res.json({ valid: false, error: 'Invalid OMDb API key' });
	}
});

// Catch-all middleware for unhandled requests
app.use('*', (req, res) => {
    console.warn(`WARN: Unhandled request - ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Addon running on ${baseUrl}`);
    console.log(`📋 Configure at: ${baseUrl}/configure`);

    // Auto-publish to Stremio Central when deployed to production (Beamup)
    if (process.env.NODE_ENV === 'production') {
        (async () => {
            try {
                console.log(`📡 Auto-publishing to Stremio Central using SDK (production deployment)...`);
                
                // Use the official Stremio SDK - same approach as your previous working code
                const manifestUrl = `${baseUrl}/manifest.json`;
                console.log(`📡 Publishing manifest URL: ${manifestUrl}`);
                
                await publishToCentral(manifestUrl);
                console.log("✅ Successfully auto-published to Stremio Central using SDK!");
                
            } catch (error) {
                console.error("⚠️ Failed to auto-publish to Stremio Central:", error.message);
                // Don't crash the server if publishing fails
                if (error.message && error.message.includes('already exists')) {
                    console.log("ℹ️ Addon might already be published with this ID - this is normal");
                } else {
                    console.log("ℹ️ You can manually publish later if needed");
                }
            }
        })();
    } else {
        console.log(`💡 Running in development mode - auto-publish disabled`);
        console.log(`💡 Use POST ${baseUrl}/publish to publish to Stremio Central`);
    }
});

// Graceful shutdown handler
function gracefulShutdown(signal) {
    console.log(`\n${signal} received, shutting down gracefully.`);
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
