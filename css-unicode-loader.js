const UNICODE_MATCH_REG = /[^\x00-\xff]/g;
const CONTENT_MATCH_REG = /(?<!-)content\s*:\s*([^;\}]+)/g;
module.exports = function (source) {
	source = source.replace(CONTENT_MATCH_REG, function (m, p1) {
		return m.replace(UNICODE_MATCH_REG, function (m) {
			return "\\" + m.charCodeAt(0).toString(16);
		});
	});
	return source;
}
