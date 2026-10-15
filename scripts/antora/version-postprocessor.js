module.exports.register = function () {
  this.once("contentAggregated", ({ contentAggregate }) => {
    for (const bucket of contentAggregate) {
      /* Draft branches. */
      if (/^draft-/.test(bucket.version)) {
        const [_, workName] = /^draft-(.*)$/.exec(bucket.version)
        bucket.displayVersion = `${workName} (draft)`
      }
    }
  })
}
