const fs = require('fs')

module.exports.register = function () {
  this.once('contentAggregated', ({ contentAggregate, playbook }) => {
    for (const { origins } of contentAggregate) {
      for (const origin of origins) {
        let collector = {
          run: {
              command: `just _build`,
              env: [{ name: "REF_NAME",
                      value: origin.refname}]
          },
          scan: {
            clean: true,
            dir: "output/docs/adoc"
          }

        }
        Object.assign((origin.descriptor.ext ??= {}), { collector })
      }
    }
  })
}
