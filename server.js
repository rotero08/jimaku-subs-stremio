const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const bent = require("bent");


const getKitsuJSON = bent("https://kitsu.io/api/edge/", "GET", "json", {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
});
const getJimakuIDJSONSetup = (apiKey) =>
    bent("https://jimaku.cc/api/", "GET", "json", {
        Authorization: apiKey,
    });
const manifest = {
    id: "community.jimakusub",
    version: "0.0.2",
    catalogs: [],
    resources: ["subtitles"],
    types: ["movie", "series"],
    name: "jimaku-sub",
    description: "Get Japanese subtitles for anime",
    behaviorHints: {
        configurable: true,
        configurationRequired: true,
    },
    config: [
        {
            key: "jimakuApiKey",
            type: "text",
            title: "Put your Jimaku API key here",
            required: true,
        },
    ],
};


const builder = new addonBuilder(manifest);


builder.defineSubtitlesHandler(async ({ type, id, config }) => {
    console.log(config)
    const token = config.jimakuApiKey;
    console.log(token)
    console.log(`Request for subtitles: ${type} ${id}`);
    const getJimakuIDJSON = getJimakuIDJSONSetup(token); // Check if the ID starts with "kitsu:"
    if (id.startsWith("kitsu:")) {
        const episode = type === "series" ? id.split(":")[2] : 0;
        const kitsuId = id.split(":")[1];
        const urlKitsu = `anime/${kitsuId}`;

        try {
            // Fetch the canonical title from Kitsu
            console.log(`Fetching Kitsu details for ID: ${kitsuId}`);
            const kitsuData = await getKitsuJSON(urlKitsu);
            const canonicalTitle = kitsuData.data.attributes.canonicalTitle;
            console.log(`Canonical Title: ${canonicalTitle}`);

            // Fetch the Jimaku ID using the canonical title
            const encodedTitle = encodeURIComponent(canonicalTitle);
            const urlJimakuID = `entries/search?query=${encodedTitle}`;
            console.log(`Fetching Jimaku ID from: ${urlJimakuID}`);
            const jimakuData = await getJimakuIDJSON(urlJimakuID);
            const jimakuID = jimakuData[0]?.id;

            if (!jimakuID) {
                console.error("No Jimaku ID found for the title");
                return { subtitles: [] };
            }

            // Fetch the subtitle files from Jimaku
            const urlJimakuFiles =
                episode === 0
                    ? `entries/${jimakuID}/files`
                    : `entries/${jimakuID}/files?episode=${episode}`;
            console.log(`Fetching Jimaku subtitle files from: ${urlJimakuFiles}`);
            const subtitleFiles = await getJimakuIDJSON(urlJimakuFiles);

            if (subtitleFiles.length > 0) {
                // Map the subtitle files to the Stremio subtitle format
                const subtitles = subtitleFiles
                    .filter((file) => file.name.endsWith(".srt"))
                    .map((file) => ({
                        id: file.name,
                        url: file.url,
                        lang: "jpn", // Language code for Japanese
                    }));

                console.log("Subtitles fetched:", subtitles);
                return { subtitles };
            } else {
                console.error("No subtitle files found for the episode");
                return { subtitles: [] };
            }
        } catch (error) {
            console.error("Error handling subtitle request:", error);
            return { subtitles: [] };
        }
    }

    console.log("ID does not start with 'kitsu:', returning empty subtitles");
    return { subtitles: [] };
});


const interface = builder.getInterface();


serveHTTP(interface, { port: 7005 });
console.log("Stremio add-on is running on http://localhost:7000");
