const fs = require("node:fs");
const path = require("node:path");
const { convertAssToSrtFromUrl } = require("./getSubtitle.js");
async function convertAssToSrtFromUrltoJimaku(url, jimakuId, episode) {
	const srtSubtitle = await convertAssToSrtFromUrl(url);
	const parsedUrl = url.split("/");
	const appendExtension = "[convertedToSrt].srt";
	const filename = decodeURIComponent(
		parsedUrl[parsedUrl.length - 1].replace(".ass", appendExtension),
	);
	console.log({ filename });
	const filePathParent = path.join(
		__dirname,
		"subtitles",
		jimakuId.toString(),
		episode.toString(),
	);
	const filePath = path.join(filePathParent, filename);
	console.log({ filePath, filePathParent });
	if (fs.existsSync(filePathParent)) {
		fs.writeFile(filePath, srtSubtitle, (err) => {
			if (err) {
				console.error(err);
			} else {
				console.log("successfully write file");
			}
		});
	} else {
		fs.mkdirSync(filePathParent, { recursive: true });
		fs.writeFile(filePath, srtSubtitle, (err) => {
			if (err) {
				console.error(err);
			} else {
				console.log("successfully write file");
			}
		});
	}
	const newurl = `https://api.echevarria.org/entry/${jimakuId}/download/${episode}/${filename}`;
	const encodedNewUrl = encodeURI(newurl);
	return encodedNewUrl;
}
const url =
	"https://jimaku.cc/entry/1681/download/%5BSkyPlace%5D%5B.hack%EF%BC%8F%EF%BC%8FG.U.%20TRILOGY%5D%5BBDrip%5D%5Bx264%20FLAC%5D%5BJP%20GB%20BIG5%5D.jp(explain).ass";
(async () => {
	console.log(await convertAssToSrtFromUrltoJimaku(url, 1681, 0));
})();
module.exports = { convertAssToSrtFromUrltoJimaku };
