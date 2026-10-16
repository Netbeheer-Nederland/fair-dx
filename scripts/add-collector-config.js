const fs = require("fs")

module.exports.register = function () {
  this.once("contentAggregated", ({ contentAggregate, playbook }) => {
    for (const { origins } of contentAggregate) {
      for (const origin of origins) {
        let collector = [
	  {
            run: {
              command: "scripts/generate-shacl.sh",
              dir: process.env.PWD
            },
            scan: {
              clean: true,
              dir: "built"
            }
	  }
        ]
        Object.assign((origin.descriptor.ext ??= {}), { collector })
      }
    }
  })
}
