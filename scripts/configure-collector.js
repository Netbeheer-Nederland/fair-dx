const fs = require('fs')
const yaml = require('js-yaml');

module.exports.register = function () {
  this.once('contentAggregated', ({ contentAggregate, playbook }) => {
    for (const { origins } of contentAggregate) {
      for (const origin of origins) {
        let collector = yaml.load(fs.readFileSync(`${process.env.PWD}/build.yml`, 'utf8'));
        Object.assign((origin.descriptor.ext ??= {}), { collector })
      }
    }
  })
}
