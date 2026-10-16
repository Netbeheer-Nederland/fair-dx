const fs = require("fs")

module.exports.register = function () {
  this.once("contentAggregated", ({ contentAggregate, playbook }) => {
    for (const { origins } of contentAggregate) {
      for (const origin of origins) {
        let collector = [
	  {
            run: {
              command: "scripts/ymld-to-jsonld.js",
              dir: process.env.PWD
            },
            scan: {
              clean: true,
              dir: "built",
              into: "modules/ROOT/attachments"
            }
	  }
        ]
        Object.assign((origin.descriptor.ext ??= {}), { collector })
      }
    }
  })
}
