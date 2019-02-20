// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient();


console.log('Server started! At http://localhost:' + port);


// app.post('/api/getVertices', async function(req, res) {
    // var data = req.body.query;
    // console.log(data);
    const fileName = '1003-set.png';
    var response = await getVertices(fileName);
    console.log(response);
    // res.send(response);
// });

async function getVertices(fileName) {
  const [result] = await client.documentTextDetection(fileName);
  const annotation = result.fullTextAnnotation;
  let paragraphs = getParagraphs(annotation);
  // console.log(paragraphs);
  let knownFields = getFields(paragraphs);
  return knownFields;
}

function getFields(paragraphs){
  let knownFields = ["Social Security Number","Name","Current Address","Contact Information",]
  let elements = knownFields.map((f, i) => {
      let para = paragraphs.find(p => p.text.includes(f));
      if (!para){
        return null;
      }
      let vertices = para.vertices;
      if (para && (para.text.indexOf(f) > 1)) {
        let firstWord = f.substr(0, f.indexOf(" "));
        let line = para.lines.find(l => l.text.includes(firstWord));
        vertices[0].x = line.vertices[0].x;
        vertices[0].y = line.vertices[0].y;

        console.log(line.vertices[0]);
      }
      para.vertices = vertices;
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
    for(let blockIndex in page.blocks) {
      let block = page.blocks[blockIndex];
      for(let paragraphIndex in block.paragraphs) {
        let paragraph = block.paragraphs[paragraphIndex];
    para = ""
    line = ""
    for(let wordIndex in paragraph.words) {
      let word = paragraph.words[wordIndex];
      for (let symbolIndex in word.symbols){
        let symbol = word.symbols[symbolIndex];
        line += symbol.text;
        // if (symbol.property && symbol.property.detected_break && symbol.property.detected_break.type == " ")
        //     line += ' '
        if (symbol.text == " ") {
          line += ' '
          lines.push(line)
          para += line
          line = ''
        }
        if (symbol.text === "\n") {
          lines.push(line)
          para += line
          line = ''
        }
      }
      line+= ' '
      lines.push({
        text: line,
        vertices: word.boundingBox.vertices,
      });
      para += line
      //console.log(line);
      line = ''
    }
    paragraphs.push({
      text: para.trim(),
      vertices: paragraph.boundingBox.vertices,
      lines: lines.map(l=>l)
    });
    lines = [];
    console.log(lines);
  }
}
}

return paragraphs;
}
