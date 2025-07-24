const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const bent = require("bent");
const { convertAssToSrtFromUrl } = require("./getSubtitle.js");
const express = require("express");

// Get the port from enviroconst myInterface = builder.getInterface();to 7005
const port = process.env.PORT || 7005;
const baseUrl = process.env.NODE_ENV === 'production' 
	? process.env.BASE_URL || `http://localhost:${port}`
	: `http://localhost:${port}`;

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
const manifest = {
	id: "community.jimakusub.v2",
	version: "2.0.0",
	catalogs: [],
	resources: ["subtitles"],
	types: ["movie", "series"],
	name: "Jimaku Subtitles v2",
	description: "Get Japanese subtitles for anime from Jimaku.cc community database. Works best with Kitsu anime addon for proper anime detection and metadata.",
	icon: "https://raw.githubusercontent.com/rotero08/jimaku-subs-stremiov2/main/icon.png", // Add your icon URL here
	behaviorHints: {
		configurable: true,
		configurationRequired: true,
	},
	config: [
		{
			key: "jimakuApiKey",
			type: "text",
			title: "Jimaku.cc API Key (REQUIRED) - Get yours at jimaku.cc/account after signing up. This gives access to the community Japanese subtitle database.",
			required: true,
		},
		{
			key: "OMDbApiKey",
			type: "text",
			title: "OMDb API Key (OPTIONAL) - Get free key at omdbapi.com. Improves subtitle detection for non-anime content and movies from IMDb.",
			required: false,
		},
	],
	//description: "SETUP INSTRUCTIONS:\n\n1. INSTALL KITSU ADDON FIRST: In Stremio, search for 'Kitsu' addon and install it. This provides anime metadata and makes subtitle detection much more reliable.\n\n2. GET JIMAKU API KEY: Sign up at jimaku.cc, go to your account settings, and copy your API key.\n\n3. OPTIONAL: Get OMDb API key from omdbapi.com for better movie support.\n\nHOW IT WORKS: This addon finds Japanese subtitles from the Jimaku.cc community database. When you watch anime (especially from Kitsu), it automatically searches for matching Japanese subtitles and converts formats when needed.",
};

const builder = new addonBuilder(manifest);

// In-memory storage for converted subtitles - only cleanup when content changes
const convertedSubtitles = new Map();
let currentContent = null; // Track current anime/episode to know when to cleanup

// Express app for serving converted subtitles
const app = express();

app.get("/converted/:id", async (req, res) => {
	const { id } = req.params;
	
	if (convertedSubtitles.has(id)) {
		const subtitleData = convertedSubtitles.get(id);
		
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Content-Disposition', `attachment; filename="${subtitleData.filename}"`);
		res.send(subtitleData.content);
		
		console.log(`Served subtitle: ${subtitleData.filename} for ${subtitleData.jimakuID}-ep${subtitleData.episode}`);
		// Keep subtitle in memory - will only be cleaned up when user switches content
	} else {
		res.status(404).json({ error: "Subtitle not found" });
	}
});

builder.defineSubtitlesHandler(async ({ type, id, config }) => {
	console.log(`Request for subtitles: ${type} ${id}`);
	
	// Create a content identifier for this request
	const contentKey = `${type}-${id}`;
	
	// If this is different content than what we had before, cleanup old conversions
	if (currentContent && currentContent !== contentKey) {
		console.log(`Content changed from ${currentContent} to ${contentKey}, cleaning up old subtitles`);
		convertedSubtitles.clear();
	}
	currentContent = contentKey;
	const jimakuApiKey = config.jimakuApiKey;
	const OMDbApiKey = config.OMDbApiKey;
	const getJimakuIDJSON = getJimakuIDJSONSetup(jimakuApiKey); // Check if the ID starts with "kitsu:"
	const getOMDbJSON = getOMDbJSONSetup(OMDbApiKey);
	let apiTitle;
	let episode;
	let apiId;
	let isAnime;
	let fallbackApiTitle;

	try {
		if (id.startsWith("kitsu:")) {
			episode = type === "series" ? id.split(":")[2] : 0;
			apiId = id.split(":")[1];
			const urlKitsu = `anime/${apiId}`;
			const kitsuData = await getKitsuJSON(urlKitsu);
			if (kitsuData.data.attributes.titles.ja_jp) {
				apiTitle = kitsuData.data.attributes.titles.ja_jp;
				fallbackApiTitle = kitsuData.data.attributes.canonicalTitle;
			} else {
				apiTitle = kitsuData.data.attributes.canonicalTitle;
			}
			isAnime = true;
		} else if (id.startsWith("tt")) {
			episode = type === "series" ? id.split(":")[2] : 0;
			apiId = id.split(":")[0];
			const urlOMDb = `i=${apiId}`;
			const OMDbdata = await getOMDbJSON(urlOMDb);

			apiTitle = OMDbdata.Title;
			if (OMDbdata.Genre.includes("Animation")) {
				isAnime = true;
			} else {
				isAnime = false;
			}
		}
		if (!apiTitle) {
			console.error("Not found any api Title");
			return { subtitles: [] };
		}

		if (isAnime) {
			console.log(`${apiTitle} is an anime`);
		} else {
			console.log(`${apiTitle} is not an anime`);
		}
		console.log(`Fetching api details for ID: ${apiId}`);

		let encodedTitle = encodeURIComponent(apiTitle);
		let urlJimakuID = `entries/search?query=${encodedTitle}`;
		if (!isAnime) {
			urlJimakuID = `${urlJimakuID}&anime=false`;
		}

		console.log(`Fetching Jimaku ID from: ${urlJimakuID}`);
		let jimakuData = await getJimakuIDJSON(urlJimakuID);
		let jimakuID = jimakuData[0]?.id;

		if (!jimakuID) {
			console.error("No Jimaku ID found for the title");
			if (fallbackApiTitle) {
				console.log("Trying with fallbackApiTitle");
				encodedTitle = encodeURIComponent(fallbackApiTitle);
				urlJimakuID = `entries/search?query=${encodedTitle}`;
				console.log(`Fetching Jimaku ID from: ${urlJimakuID}`);
				jimakuData = await getJimakuIDJSON(urlJimakuID);
				jimakuID = jimakuData[0]?.id;
				if (!jimakuID) {
					console.error("No Jimaku ID found for the fallbackApiTitle");
					return { subtitles: [] };
				}
			}
		}

		const urlJimakuFiles =
			episode === 0
				? `entries/${jimakuID}/files`
				: `entries/${jimakuID}/files?episode=${episode}`;
		console.log(`Fetching Jimaku subtitle files from: ${urlJimakuFiles}`);
		const subtitleFiles = await getJimakuIDJSON(urlJimakuFiles);

		if (subtitleFiles.length > 0) {
			const subtitles = subtitleFiles
				.filter((file) => file.name.endsWith(".srt"))
				.map((file) => ({
					id: file.name,
					url: file.url,
					lang: "jpn",
				}));
			if (subtitles.length > 0) {
				console.log("Subtitles fetched:", subtitles);
				return { subtitles };
			}
			if (subtitles.length === 0) {
				const assSubtitles = await Promise.all(
					subtitleFiles
						.filter((file) => file.name.endsWith(".ass"))
						.map(async (file) => {
							// Convert ASS to SRT in memory
							const srtContent = await convertAssToSrtFromUrl(file.url);
							
							// Generate unique ID for this specific conversion (includes content hash for uniqueness)
							const contentHash = file.url.split('/').pop().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
							const conversionId = `${jimakuID}-ep${episode}-${contentHash}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
							
							// Store in memory until user switches to different content
							const filename = file.name.replace(".ass", "[convertedToSrt].srt");
							convertedSubtitles.set(conversionId, {
								content: srtContent,
								filename: filename,
								jimakuID: jimakuID,
								episode: episode
							});
							
							// Return subtitle object with our conversion endpoint
							return {
								id: filename,
								url: `${baseUrl}/converted/${conversionId}`,
								lang: "jpn",
							};
						})
				);
				
				if (assSubtitles.length > 0) {
					console.log("Converted ASS subtitles:", assSubtitles);
					return { subtitles: assSubtitles };
				}
				console.log("No subtitles");
				return { subtitles: [] };
			}
			console.log("No subtitles");
			return { subtitles: [] };
		}
	} catch (error) {
		console.error("Error handling subtitle request:", error);
		return { subtitles: [] };
	}
	console.log("ID does not start with 'kitsu:', returning empty subtitles");
	return { subtitles: [] };
});

const myInterface = builder.getInterface();

// Use serveHTTP with the addon interface and our Express app
serveHTTP(myInterface, { 
	port: port,
	cache: 1200,  // 20 minutes - optimized for anime episode length
	app: app 
});

console.log(`Stremio add-on is running on http://localhost:${port}`);

publishToCentral("https://my-addon.awesome/manifest.json")
