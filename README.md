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

To find a **word** in a image
```
let vertices = await wordFinder.findWord('imagepath.png', "birth");
```

To find **multiple words** in a image
```
let vertices = await wordFinder.findWord('imagepath.png', [
  "Name",
  "Current Address",
  "Contact Information",
]);
```

To find words in a image with **case insensitivity** (By default, it is case sensitive)
```
let options = {
  caseSensitive: false,
}

let vertices = await wordFinder.findWord('imagepath.png', [
  "Name",
  "Current Address",
  "Contact Information",
], options);

vertices = await wordFinder.findWord('imagepath.png', "birth", options);

```

The output of the word finder is as follows,

```
let vertices = await wordFinder.findWord('imagepath.png', "birth");

console.log(vertices);

==================================================================

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


The above vertices can be used in various ways:

1. To find exact position of word,
```
let vertices = await wordFinder.findWord('imagepath.png', "birth");

let x = vertices.vertices.origin.x;
let y = vertices.vertices.origin.y;

let xEnd = vertices.vertices.origin.x + vertices.vertices.width;
let yEnd = vertices.vertices.origin.y + vertices.vertices.height;

```

2. To draw the boundary of word in css,
```
let element = document.createElement('div');

element.style.position = "absolute";
element.style.left = vertices.vertices.origin.x;
element.style.top = vertices.vertices.origin.y;
element.style.width = vertices.vertices.origin.x + vertices.vertices.width;
element.style.height = vertices.vertices.origin.y + vertices.vertices.height;

let body = document.getElementsByTagName('body')
body[0].appendChild(element);

```


To find **distance between two words** in a image
```
let distance = await wordFinder.findWord('imagepath.png', "Name", "Date of Birth");
```

The object format of distance object is as below,
```
{
	"distanceX": 306,
	"distanceY": 25,
	"word1": {
		"para_text": "Personal Information Name ( First , Middle , Last , Suffix )",
		"vertices": {
			"width": 24,
			"height": 11,
			"origin": {
				"x": 38,
				"y": 176
			}
		},
		"index": {
			"page_index": 0,
			"block_index": 5
		},
		"para_vertices": {
			"origin": {
				"x": 38,
				"y": 160
			},
			"height": 27,
			"width": 119
		},
		"word": "Name"
	},
	"word2": {
		"para_text": "Alternate Names - List any names by which you are known or any names Date of Birth",
		"vertices": {
			"width": 17,
			"height": 9,
			"origin": {
				"x": 344,
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
		"word": "Date of Birth"
	}
}
```
