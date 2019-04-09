// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient();

const DEFAULT_OPTIONS = {
  caseSensitive: true,
}

async function findWord(fileName, word, options = DEFAULT_OPTIONS) {
  if (fileName== undefined) {
    throw new Error("File name not found.");
  }
  var paragraphs = await getParaVertices(fileName);
  if (word == undefined) {
    throw new Error("Word to be found not given.");
  }
  if (Array.isArray(word)) {
    let words = word;
    vertices = getFields(paragraphs, words, options);
  }
  if (typeof word == 'string') {
    vertices = getFields(paragraphs, [word], options);
    if (vertices) {
      vertices = vertices[0];
    }
  }
  return vertices;
}

async function findDistanceBetween(fileName, word1, word2) {
  if (fileName== undefined) {
    throw new Error("File name not found.");
  }

  let word1Position = await findWord(fileName, word1);
  let word2Position = await findWord(fileName, word2);

  let vertices1 = word1Position.vertices;
  let vertices2 = word2Position.vertices;

  let originX = vertices1.origin.x;
  // let originX = Math.min(vertices1.origin.x, vertices2.origin.x);

  // let swap = (x) => x;

  // if (originX === vertices2.origin.x) {
  //   word2Position = swap(word1Position, word1Position=word2Position);
  //   vertices2 = swap(vertices1, vertices1=vertices2);
  // }

  let distanceX = 0;
  let distanceY = 0;

  distanceX = vertices2.origin.x - originX;

  // distanceX = ((vertices1.origin.x + vertices1.width) > vertices2.origin.x)
  //               ? (vertices2.origin.x - originX)
  //               : (vertices2.origin.x - (originX + vertices1.width));

  // let originY = Math.min(vertices1.origin.y, vertices2.origin.y);
  let originY = vertices1.origin.y;

  // if (originY === vertices2.origin.y) {
  //   word2Position = swap(word1Position, word1Position=word2Position);
  //   vertices2 = swap(vertices1, vertices1=vertices2);
  // }

  distanceY = vertices2.origin.y - originY;

  // distanceY = ((vertices1.origin.y + vertices1.height) > vertices2.origin.y)
  //               ? (vertices2.origin.y - originY)
  //               : (vertices2.origin.y - (originY + vertices1.height));

  // console.log(distanceX, distanceY);

  return {
    distanceX,
    distanceY,
    word1: word1Position,
    word2: word2Position,
  };

}

async function getParaVertices(fileName) {
  const [result] = await client.documentTextDetection(fileName);
  const annotation = result.fullTextAnnotation;
  let paragraphs = getParagraphs(annotation);
  return paragraphs;
}

function getFields(paragraphs, words, options = DEFAULT_OPTIONS){
  let elements = words.map((word, i) => {
    let para = paragraphs.find(p => {
      let paraText = options.caseSensitive ? p.para_text : p.para_text.toLowerCase();
      let wordCase = options.caseSensitive ? word : word.toLowerCase();
      return paraText.includes(wordCase);
    });
    if (!para){
      return null;
    }

    let fullPara = {
      origin: {
        x: para.vertices.origin.x,
        y: para.vertices.origin.y,
      },
      height: para.vertices.height,
      width: para.vertices.width,
    };
    para.para_vertices = fullPara;

    let firstWord = word.trim();
    if (word.indexOf(" ") >= 0 ) {
      firstWord = word.substr(0, word.indexOf(" "));
    }
    
    let line = para.lines.find(l => {
      let lineText = options.caseSensitive ? l.text : l.text.toLowerCase();
      let firstWordCase = options.caseSensitive ? firstWord : firstWord.toLowerCase();
      return lineText.includes(firstWordCase)
    });

    para.vertices.origin.x = line.origin.x;
    para.vertices.origin.y = line.origin.y;
    para.vertices.height = line.height;
    para.vertices.width = line.width;

    para.word = word;
    delete para.lines;
    return para;
  })
  .filter(f => f != null);
  return elements;
}

function getParagraphs(annotation) {
    let paragraphs = []
    let lines = []
    for (let pageIndex in annotation.pages) {
        let page = annotation.pages[pageIndex];
        for (let blockIndex in page.blocks) {
            let block = page.blocks[blockIndex];
            for (let paragraphIndex in block.paragraphs) {
                let paragraph = block.paragraphs[paragraphIndex];
                para = ""
                line = ""
                for (let wordIndex in paragraph.words) {
                    let word = paragraph.words[wordIndex];
                    for (let symbolIndex in word.symbols) {
                        let symbol = word.symbols[symbolIndex];
                        line += symbol.text;
                    }
                    line += ' '
                    lines.push({
                        text: line,
                        // vertices: word.boundingBox.vertices,
                        width: word.boundingBox.vertices[1].x - word.boundingBox.vertices[0].x,
                        height: word.boundingBox.vertices[2].y - word.boundingBox.vertices[0].y,
                        origin: word.boundingBox.vertices[0],
                    });
                    para += line
                    line = ''
                }
                paragraphs.push({
                    para_text: para.trim(),
                    // vertices: paragraph.boundingBox.vertices,
                    lines: lines.map(l => l),
                    vertices: {
                      width: paragraph.boundingBox.vertices[1].x - paragraph.boundingBox.vertices[0].x,
                      height: paragraph.boundingBox.vertices[2].y - paragraph.boundingBox.vertices[0].y,
                      origin: paragraph.boundingBox.vertices[0],
                    },
                    index: {
                      page_index: parseInt(pageIndex, 0),
                      block_index: parseInt(blockIndex, 0),
                    }
                });
                lines = [];
            }
        }
    }

    return paragraphs;
}

module.exports = {
  findWord,
  findDistanceBetween,
  getParaVertices,
}
