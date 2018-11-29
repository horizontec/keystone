var async = require('async');

var _getAllFilesFromFolder = function(dir) {

	var filesystem = require("fs");
	var results = [];

	if (!filesystem.existsSync(dir)) return results

	filesystem.readdirSync(dir).forEach(function(file) {

			/* file = dir+'/'+file;
			var stat = filesystem.statSync(file);

			if (stat && stat.isDirectory()) {
					results = results.concat(_getAllFilesFromFolder(file))
			}
			else */
				results.push(file);

	});

	return results;
};

module.exports = function (req, res) {
	const dir = './public/uploads'
	return res.json({
		locals: _getAllFilesFromFolder(dir)
	})
};
