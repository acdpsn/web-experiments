var fs = require('node:fs');
var folders = fs.readdirSync('experiments/');

folders.forEach(sub => {
	fs.readFile(`experiments/${ sub }/index.html`, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		
		console.log(data.indexOf('\n'));
	});
});

/* // TODO
update titles of all pages to match correct route
get titles of all pages
create new index.html file
insert list of all page titles
template header and footer
*/