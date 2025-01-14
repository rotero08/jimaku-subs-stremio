const asstosrt = require("ass-to-srt");
async function convertAssToSrtFromUrl(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const readable = response.body;
		const utf8decoder = new TextDecoder();

		let arrayString = "";
		for await (const chunk of readable)
			arrayString += utf8decoder.decode(chunk, { stream: true });
		arrayString += utf8decoder.decode();
		const output = asstosrt(arrayString);
		return output;
	} catch (error) {
		console.error(error.message);
	}
}

// const url =
// 	"https://jimaku.cc/entry/1484/download/%5BQYQ%5D%5BKanon%5D%5BDVDRIP%5D%5B05%5D%5BAVC_AAC%5D%5B9F4DE474%5D.jp.ass";
// (async () => {
// 	const srtSubtitle = await convertAssToSrtFromUrl(url);
// 	console.log(srtSubtitle);
// })();
module.exports = { convertAssToSrtFromUrl };
