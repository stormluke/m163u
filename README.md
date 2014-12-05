m163u [![NPM Version](https://img.shields.io/npm/v/m163u.svg?style=flat)](https://npmjs.org/package/m163u)
=====

Generate playlist file from music.163.com.

## Installation

```
$ [sudo] npm install -g m163u
```

## Usage

```
Usage: m163u <playlistId> [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -o, --output <filename>  playlist filename, default is original name
    -f, --format <format>    playlist format, default is m3u
    -t, --title <format>     title format, default is [artist] - [track]
    -l, --location <format>  location format, default is [artist]/[album]/[artist] - [track].mp3

  Supported playlist format:

    m3u

  Supported format tags:

    [album], [artist], [track]
```

## Examples

### Default

```
$ m163u 11641012
```

will generate file `iTunes榜.m3u8` and content is

```
#EXTM3U
#EXTINF:231,Taylor Swift - Blank Space
Taylor Swift/1989/Taylor Swift - Blank Space.mp3
...
```

### With Options

```
$ m163u 11641012 -o mylist -f m3u -t '[track]' -l '[track].mp3'
```

will generate file `mylist.m3u8` and content is

```
#EXTM3U
#EXTINF:231,Blank Space
Blank Space.mp3
...
```

## License

MIT