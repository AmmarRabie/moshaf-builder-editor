const { EventEmitter } = require("events")

const SegmentAnnotation = require("./segment-annotation")


class SegmentAnnotationList {

    static template = `<ul class="annotations" id="annotations-container"></ul>`
    constructor(options) {
        if (!options.container) throw Error("should have container when init segment annotations list")
        this.$container = $(options.container)
        this.$annotationList = $(SegmentAnnotationList.template)
        this.segmentsList = []
        this.emitter = options.eventEmitter || new EventEmitter()
        const defaultSegments = options.segments || []
        defaultSegments.forEach(seg => this.addSegment(seg))

        this._setupEmitter()
    }

    addSegment(segment) {
        console.log("adding segment respond", segment);
        const newSegment = new SegmentAnnotation({ container: this.$instance, eventEmitter: this.emitter }, segment)
        this.segmentsList.push(newSegment)
        this.$instance.append(newSegment.$instance)
    }

    removeSegment(segment) {
        console.log("removing segment respond");

    }

    _setupEmitter() {
        // manipulates the list (adding or removing)
        this.emitter.on("segments.add", newSegments => { //? considered peaks dependency here
            newSegments.map(seg => this.addSegment(seg))
        }) 
        this.emitter.on("segments.remove", this.removeSegment) //? considered peaks dependency here
    }


    get $instance() {
        return this.$annotationList
    }

    destroy(){
        this.clear()
        this.$container.empty()
    }

    clear(){
        this.$instance.empty()
    }
}


module.exports = SegmentAnnotationList