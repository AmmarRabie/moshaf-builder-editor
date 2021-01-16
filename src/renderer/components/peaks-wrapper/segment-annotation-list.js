const SegmentAnnotation = require("./segment-annotation")
const BaseAnnotationList = require("./base-annotation-list")


class SegmentAnnotationList extends BaseAnnotationList {

    static template = `<ul class="annotations" id="annotations-container"></ul>`
    constructor(options) {
        // some sort of validation
        if (!options.container) throw Error("should have container when init chapter annotations list")

        options.template = SegmentAnnotationList.template
        super(options)
    }

    _createNewAnnotation(annotation) {
        return new SegmentAnnotation({ container: this.$instance, eventEmitter: this.emitter }, annotation)
    }
}


module.exports = SegmentAnnotationList