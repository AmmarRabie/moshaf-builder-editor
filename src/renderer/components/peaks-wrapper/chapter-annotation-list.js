const ChapterAnnotation = require("./chapter-annotation")
const BaseAnnotationList = require("./base-annotation-list")


class ChapterAnnotationList extends BaseAnnotationList {

    static template = `<ul class="annotations annotations--chapter" id="annotations-container"></ul>`
    constructor(options) {
        // some sort of validation
        if (!options.container) throw Error("should have container when init chapter annotations list")

        options.template = ChapterAnnotationList.template
        super(options)
    }

    _createNewAnnotation(annotation) {
        return new ChapterAnnotation({ container: this.$instance, eventEmitter: this.emitter }, annotation)
    }
}


module.exports = ChapterAnnotationList