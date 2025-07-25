const asstosrt = require("ass-to-srt");

async function convertAssToSrtFromUrl(url) {
	try {
		console.log(`🔄 Starting ASS to SRT conversion for: ${url}`);
		
		// Use fetch (available in Node 18+)
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Get the response as text directly - simpler and more reliable
		const assContent = await response.text();
		
		if (!assContent || assContent.trim().length === 0) {
			throw new Error('Empty ASS content received');
		}

		console.log(`📝 ASS content length: ${assContent.length} characters`);
		
		// Convert ASS to SRT
		const srtContent = asstosrt(assContent);
		
		if (!srtContent || srtContent.trim().length === 0) {
			throw new Error('ASS to SRT conversion resulted in empty content');
		}

		console.log(`✅ ASS to SRT conversion successful, SRT length: ${srtContent.length} characters`);
		return srtContent;
		
	} catch (error) {
		console.error(`❌ Error in convertAssToSrtFromUrl:`, error.message);
		console.error(`❌ URL was: ${url}`);
		throw error; // Re-throw to let the caller handle it
	}
}

// const url =
// 	"https://jimaku.cc/entry/1484/download/%5BQYQ%5D%5BKanon%5D%5BDVDRIP%5D%5B05%5D%5BAVC_AAC%5D%5B9F4DE474%5D.jp.ass";
// (async () => {
// 	const srtSubtitle = await convertAssToSrtFromUrl(url);
// 	console.log(srtSubtitle);
// })();
module.exports = { convertAssToSrtFromUrl };
