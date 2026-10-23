const SRC_DIR = 'src';
const BUILT_DIR = 'built';


module.exports.register = function () {
  this.once("contentAggregated", ({ contentAggregate }) => {
    for (const { origins } of contentAggregate) {
      for (const origin of origins) {
        let collector = [
          {
            run:
            {
              command: "scripts/render-component-version.js",
              dir: process.env.PWD,
              env: [
                {
                  "name": "SRC_DIR",
                  "value": SRC_DIR
                },
                {
                  "name": "BUILT_DIR",
                  "value": BUILT_DIR
                }
              ]
            },
            scan: {
              clean: true,
              dir: BUILT_DIR
            }
          }
        ]
        Object.assign((origin.descriptor.ext ??= {}), { collector })
      }
    }
  })
}
