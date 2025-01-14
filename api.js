const express = require("express");
const app = express();
const fs = require("node:fs");
const path = require("node:path");
app.get("/api/entries/:id/:episode", (req, res) => {
	const { id, episode } = req.params;
	const subtitlesDir = path.join(__dirname, "subtitles", id, episode);
	fs.readdir(subtitlesDir, (err, files) => {
		if (err) {
			return res.status(404).json({ error: "Subtitles not found." });
		}
		const urls = files.map((file) => {
			const jsonResponse = {
				name: file,
				url: `${req.protocol}://${req.get("host")}/entry/${id}/download/${episode}/${encodeURIComponent(file)}`,
			};
			return jsonResponse;
		});
		res.json(urls);
	});
});
app.use("/entry/:id/download/:episode/:file", (req, res) => {
	const { id, episode, file } = req.params;
	const filePath = path.join(__dirname, "subtitles", id, episode, file);
	console.log(filePath);
	res.download(filePath, (err) => {
		if (err) {
			res.status(404).json({ error: "File not found." });
		}
	});
});
console.log(__dirname);
app.listen(7010);
