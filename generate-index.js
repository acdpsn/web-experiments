const fs = require("node:fs");
const fsp = require("node:fs").promises;
const jsdom = require("jsdom");
const prettier = require("prettier");

const folders = fs.readdirSync("experiments/");
const { JSDOM } = jsdom;

var pages = [];

folders.forEach((sub) => {
  fs.readFile(`experiments/${ sub }/index.html`, "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dom = new JSDOM(data);
    const doc = dom.window.document;
    const titleEl = doc.querySelector("title");

    if (!titleEl) {
      console.error(`Page in ${ sub } is missing a title.`);
      return;
    }

    const title = titleEl.textContent;
    const genTimeEl = doc.querySelector("meta[name=generated-timestamp]") ?? await createTimestamp(dom, sub);

    const genTime = genTimeEl.getAttribute("content");
    const page = new Object();
    page.title = title;
    page.href = `experiments/${ sub }/index.html`;
    page.index = genTime;
    pages.push(page);
    console.log("title: ", genTime.padStart(13, " "), title);
  });
});

pages.sort((a, b) => a.index - b.index);
console.log('pages:', pages)

const createTimestamp = async (dom, sub) => {
  const doc = dom.window.document;
  const newGenTimeEl = doc.createElement("meta");
  const titleEl = doc.querySelector("title");
  newGenTimeEl.setAttribute("name", "generated-timestamp");
  newGenTimeEl.setAttribute("content", Date.now());
  titleEl.insertAdjacentElement("afterend", newGenTimeEl);
  const output = await prettier.format(dom.serialize(), { parser: "html" });

  if (!fs.existsSync(`temp`)) {
    fs.mkdirSync(`temp`);
  }

  fs.writeFile(`temp/index.html`, output, (err) => {
    err && console.error(err);
  });

  return doc.querySelector("meta[name=generated-timestamp]");
}

/* //////// TODO ////////
use fsp to get list of pages before running sort
sort list of pages by timestamp
generate new homepage with list of pages
create a template for the homepage
run script on commit with husky
add typing to variables and function parameters? .ts
*/
