const fs = require("node:fs");
const jsdom = require("jsdom");
const prettier = require("prettier");

const folders = fs.readdirSync("experiments/");
const { JSDOM } = jsdom;

folders.forEach((sub) => {
  fs.readFile(`experiments/${sub}/index.html`, "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dom = new JSDOM(data);
    const doc = dom.window.document;
    const titleEl = doc.querySelector("title");

    if (!titleEl) {
      console.error(`Page in ${sub} is missing a title.`);
      return;
    }

    const title = titleEl.textContent;
    let genTimeEl = doc.querySelector("meta[name=generated-timestamp]");

    if (!genTimeEl) {
      const newGenTimeEl = doc.createElement("meta");
      newGenTimeEl.setAttribute("name", "generated-timestamp");
      newGenTimeEl.setAttribute("content", Date.now());
      const titleEl = doc.querySelector("title");
      titleEl.insertAdjacentElement("afterend", newGenTimeEl);
      genTimeEl = doc.querySelector("meta[name=generated-timestamp]");
      titleEl.insertAdjacentHTML("afterend", "\n");
      // todo: indent new meta tag properly
      // get previous line, substring from beginning of line to tag start, append after newline insert
      if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
      }
      const output = await prettier.format(dom.serialize(), { parser: "html" });
      fs.writeFile("temp/test.html", output, (err) => {
        err && console.error(err);
      });
    }

    const genTime = genTimeEl.getAttribute("content");
    console.log("title: ", title, genTime);
  });
});

/* // TODO
generate new index.html file
insert list of all page titles
template header and footer
run script on commit with husky
cleanup script
*/
