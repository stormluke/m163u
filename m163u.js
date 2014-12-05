var url = require('url');
var fs = require('fs');
var commander = require('commander');
var request = require('request');
var utils = require('./utils');

var baseUrl = 'http://music.163.com/api/playlist/detail';

var m3uSpec = {
  name: 'm3u',
  extension: '.m3u8',
  header: function() {
    return '#EXTM3U\n';
  },
  entry: function(properties) {
    return '#EXTINF:' + properties.duration + ',' + properties.title + '\n' +
           properties.location + '\n';
  }
};

var supportedSpec = {
  'm3u': m3uSpec
};

var options = {
  spec: m3uSpec,
  title: '[artist] - [track]',
  location: '[artist]/[album]/[artist] - [track].mp3'
};

var playlist = function(tracks, options, success, error) {
  var title = function(artist, album, track) {
    var title = utils.replaceAll(options.title, {
      '[artist]': artist,
      '[album]': album,
      '[track]': track
    });
    return title;
  };
  var location = function(artist, album, track) {
    var location = utils.replaceAll(options.location, {
      '[artist]': artist,
      '[album]': album,
      '[track]': track
    });
    return location;
  };
  var file = fs.createWriteStream(options.filename + options.spec.extension);
  file.on('error', function(err) {
    error(err);
  });
  file.on('finish', function() {
    success();
  });
  if (options.spec.header) {
    file.write(options.spec.header());
  }
  tracks.forEach(function(track) {
    var artist = track.artists[0].name;
    var album = track.album.name;
    var trackName = track.name;
    var duration = Math.floor(track.duration / 1000);
    file.write(options.spec.entry({
      title: title(artist, album, trackName),
      location: location(artist, album, trackName),
      duration: duration
    }));
  });
  if (options.spec.footer) {
    file.write(options.spec.footer());
  }
  file.end();
};

var fetch = function(playlistId, success, error) {
  var destUrl = url.parse(baseUrl);
  destUrl.query = {
    id: playlistId
  };
  request(url.format(destUrl), function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      if (json.code === 200) {
        if (!options.filename) {
          options.filename = json.result.name;
        }
        return success(json.result.tracks);
      }
    }
    if (error) {
      error(err);
    }
  });
};

var initCLI = function() {
  commander
    .version('0.0.1')
    .usage('<playlistId> [options]')
    .option('-o, --output <filename>', 'playlist filename, default is original name',
      function(filename) {
        if (filename) {
          options.filename = filename;
        }
    })
    .option('-f, --format <format>', 'playlist format, default is ' + options.spec.name,
      function(format) {
        if (format && supportedSpec[format]) {
          options.spec = supportedSpec[format];
        } else {
          process.exit(-1);
        }
    })
    .option('-t, --title <format>', 'title format, default is ' + options.title,
      function(format) {
        if (format) {
          options.title = format;
        }
    })
    .option('-l, --location <format>', 'location format, default is ' + options.location,
      function(format) {
        if (format) {
          options.location = format;
        }
    })
    .on('--help', function(){
      console.log('  Supported playlist format:');
      console.log('');
      console.log('    ' + Object.keys(supportedSpec).join(', '));
      console.log('');
      console.log('  Supported format tags:');
      console.log('');
      console.log('    [album], [artist], [track]');
      console.log('');
    })
    .parse(process.argv);

  if (commander.args.length >= 1) {
    options.playlistId = commander.args[0];
  } else {
    console.error('Error: Insufficient arguments. Use -h for more help.');
    process.exit(-1);
  }
};

var startCLI = function() {
  initCLI();
  fetch(options.playlistId, function(tracks) {
    playlist(tracks, options, function() {
    }, function(err) {
      console.error('Error: Can not write local file.');
      process.exit(-1);
    });
  }, function(err) {
    console.error('Error: Can not fetch remote playlist.');
    process.exit(-1);
  });
};

module.exports.playlist = playlist;
module.exports.startCLI = startCLI;
