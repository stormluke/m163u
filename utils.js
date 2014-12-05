var escapeRegExp = function(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

module.exports.replaceAll = function(string, pairs) {
  var result = string;
  for (var find in pairs) {
    result = result.replace(new RegExp(escapeRegExp(find), 'g'), pairs[find]);
  }
  return result;
};