const fs = require("fs")
const path = require("path")
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

const quranXML = fs.readFileSync(path.join(__dirname, "../assets/quran-simple-clean.xml"))
parser.parseStringPromise(quranXML).then(data => {
    console.log(data);
    fs.writeFileSync(path.join(__dirname, "../assets/quran-simple-clean.json"), JSON.stringify(data))
})