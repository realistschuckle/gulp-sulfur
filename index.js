var parse = require('parse5'),
		through = require('through2'),
		util = require('gulp-util'),
		path = require('path'),

		serializer = new parse.Serializer(),
		fileIndex = 0;


const PLUGIN_NAME = 'gulp-sulfur';

function * iterateNodeChildren (node) {
	if (node && node.childNodes) {
		for (var i = 0; i < node.childNodes.length; i += 1) {
			yield {index: i, child: node.childNodes[i]};
		}
	}
}

function extract (tagName, extension) {
	return function (relative, coll, index, node) {
		if (node.nodeName === tagName) {
			var relative = fileIndex + '.' + util.replaceExtension(relative, extension);
			fileIndex += 1;
			
			coll[index] = {
				nodeName: '#comment',
				data: relative,
				parentNode: node.parentNode
			};

			return {
				relative: relative,
				tagName: tagName,
				contents: serializer.serialize(node).trim()
			};
		}
	}
}

var extractors = [
	extract('script', '.js'),
  extract('style', '.css')
];

function walk(plugin, file, node) {
	var newFile = undefined;
	for (var o of iterateNodeChildren(node)) {
		for (var extractor of extractors) {
			tag = extractor(file.relative, node.childNodes, o.index, o.child);
			if (tag) {
				newFile = new util.File({
					path: path.join(process.cwd(), tag.relative),
					contents: new Buffer(tag.contents + '\n')
				});
				newFile.source = file.relative;
				newFile.tagName = tag.tagName;
				plugin.push(newFile);
			}
		}
		walk(plugin, file, o.child);
	}
}

function heat (opts) {
	return through.obj(function (file, enc, cb) {
		if (file.isStream()) {
			this.emit('error', new util.PluginError(PLUGIN_NAME, 'Does not support streams.'));
			return cb();
		}

		var content = undefined;
		var parser = new parse.Parser();
		var component = parser.parseFragment(file.contents.toString());

		walk(this, file, component);

		file.contents = new Buffer(serializer.serialize(component));
		file.heated = true;
		this.push(file);
		cb();
	});
}

function anneal (opts) {
	var cooler = new Map();
	
	return through.obj(function (file, enc, cb) {
		var key = file.heated? file.relative : file.source;
		if (key && !cooler.has(key)) {
			cooler.set(key, {source: null, others: []});
		}

		var obj = cooler.get(key);
		if (obj) {
			if (file.heated) {
				obj.source = file;
			} else if (file.source) {
				obj.others.push(file);
			}
		}
		cb();
	}, function (cb) {
		for (var key of cooler.keys()) {
			var record = cooler.get(key);
			var content = record.source.contents.toString();

			for (var atom of record.others) {
				var placeholder = `<!--${atom.relative}-->`;
				var replacement = `<${atom.tagName}>${atom.contents.toString()}</${atom.tagName}>`;
				content = content.replace(placeholder, replacement);
			}

			record.source.contents = new Buffer(content);
			
			this.push(record.source);
		}
		cooler.clear();
		cb();
	});
}

module.exports = {
	heat: heat,
	anneal: anneal
};
