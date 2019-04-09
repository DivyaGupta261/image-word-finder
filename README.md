# image-word-finder
Wrapper library for Google vision OCR to find position of a word/line/para in a image.


Start from here: https://cloud.google.com/vision/docs/quickstart

## Methods to find word from image

Installation

```
npm install imagewordfinder
```

Include the module

```
const wordFinder = require('imagewordfinder');
```

To find a word in a image
```
let vertices = await start.findWord('imagepath.png', "birth");
```

To find multiple words in a image
```
let vertices = await start.findWord('imagepath.png', [
  "Name",
  "Current Address",
  "Contact Information",
]);
```

To find words in a image with case insensitivity (By default, it is case sensitive)
```
let options = {
  caseSensitive: false,
}

let vertices = await start.findWord('imagepath.png', [
  "Name",
  "Current Address",
  "Contact Information",
], options);

vertices = await start.findWord('imagepath.png', "birth", options);

```


```
{
	"para_text": "Alternate Names - List any names by which you are known or any names Date of Birth",
	"vertices": {
		"width": 17,
		"height": 9,
		"origin": {
			"x": 374,
			"y": 201
		}
	},
	"index": {
		"page_index": 0,
		"block_index": 5
	},
	"para_vertices": {
		"origin": {
			"x": 39,
			"y": 188
		},
		"height": 23,
		"width": 471
	},
	"word": "birth"
}

```
