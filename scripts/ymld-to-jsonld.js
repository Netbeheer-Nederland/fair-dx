const fs = require('fs');
const yaml = require('js-yaml');

(() => {
    try {
        const yamlContent = fs.readFileSync('src/modules/ROOT/attachments/dataset.metadata.shacl.ymld', 'utf8');
        const data = yaml.load(yamlContent);
        const jsonString = JSON.stringify(data, null, 2); // 2-space indentation
        fs.mkdir("built", (error) => {
            if (error) {
                console.log(error);
            }
	});
        fs.writeFileSync('built/dataset.metadata.shacl.jsonld', jsonString, 'utf8');
    } catch (error) {
        console.error('Error converting YAML to JSON:', error.message);
        throw error;
    }
})();
