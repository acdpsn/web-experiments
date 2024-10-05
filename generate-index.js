const fs = require("node:fs");
const jsdom = require("jsdom");
const prettier = require("prettier");

const main = async () => {
  const { JSDOM } = jsdom;
  const allFileData = [];
  const dunnos = [];
  const folders = await new Promise((resolve, reject) => {
    fs.readdir(
      "experiments/", undefined, (err, subfolders) => {
        if (err) {
          return reject(err);
        }
        resolve(subfolders);
      }
    );
  });

  for (const folder of folders) {
    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(`experiments/${ folder }/index.html`, "utf8", (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve({ folder, data });
      });
    });

    allFileData.push(fileData);
  }

  for (const fileData of allFileData) {
    const dom = new JSDOM(fileData.data);
    const doc = dom.window.document;
    const titleEl = doc.querySelector("title");

    if (!titleEl) {
      console.error(`Page in ${ fileData.folder } is missing a title.`);
      return;
    }

    const title = titleEl.textContent;
    const genTimeEl = doc.querySelector("meta[name=generated-timestamp]") ??
      await createTimestamp(dom);

    const genTime = genTimeEl.getAttribute("content");
    const dunno = new Object();
    dunno.title = title;
    dunno.href = `experiments/${ fileData.folder }/index.html`;
    dunno.index = genTime;
    dunnos.push(dunno);
  }

  dunnos.sort((a, b) => a.index - b.index).reverse();
  for (const dunno of dunnos) {
    console.log("page: ", dunno.index.padStart(13, " "), dunno.title);
  }
};

const createTimestamp = async (dom) => {
  const doc = dom.window.document;
  const newGenTimeEl = doc.createElement("meta");
  const titleEl = doc.querySelector("title");
  newGenTimeEl.setAttribute("name", "generated-timestamp");
  newGenTimeEl.setAttribute("content", Date.now());
  titleEl.insertAdjacentElement("afterend", newGenTimeEl);
  const output = await prettier.format(dom.serialize(), { parser: "html" });

  if (!fs.existsSync("temp")) {
    fs.mkdirSync("temp");
  }

  fs.writeFile("temp/index.html", output, (err) => {
    err && console.error(err);
  });

  return doc.querySelector("meta[name=generated-timestamp]");
}

if (require.main === module) {
  main();
}

/* //////// TODO ////////
generate new homepage with list of pages
create a template for the homepage
run script on commit with husky
add typing to variables and function parameters? .ts
*/
