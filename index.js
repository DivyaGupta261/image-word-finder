// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient();

async function start(fileName, word) {
  if (fileName== undefined) {
    throw new Error("File name not found.");
  }
  var paragraphs = await getParaVertices(fileName);
  if (word == undefined) {
    return;
  }
  if (Array.isArray(word)) {
    let words = word;
    vertices = getFields(paragraphs, words);
  }
  if (typeof word == 'string') {
    vertices = getFields(paragraphs, [word]);
    if (vertices) {
      vertices = vertices[0];
    }
  }
  return vertices;
}

async function getParaVertices(fileName) {
  const [result] = await client.documentTextDetection(fileName);
  const annotation = result.fullTextAnnotation;
  let paragraphs = getParagraphs(annotation);
  return paragraphs;
}

function getFields(paragraphs, words){
  let elements = words.map((word, i) => {
      let para = paragraphs.find(p => p.para_text.includes(word));
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

      if (para && (para.para_text.indexOf(word) > 1)) {
        let firstWord = word.trim();
        if (word.indexOf(" ") >= 0 ) {
          firstWord = word.substr(0, word.indexOf(" "));
        }
        let line = para.lines.find(l => l.text.includes(firstWord));
        para.vertices.origin.x = line.origin.x;
        para.vertices.origin.y = line.origin.y;
        para.vertices.height = line.height;
        para.vertices.width = line.width;
      }

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

module.exports = start;
