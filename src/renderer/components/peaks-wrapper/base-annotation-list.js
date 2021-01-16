const { EventEmitter } = require("events")


class BaseAnnotationList {
    static template = `<ul class="annotations" id="annotations-container"></ul>`
    constructor(options) {
        if (!options.container) throw Error("should have container when init segment annotations list")
        this.$container = $(options.container)
        this.$annotationList = $(options.template || BaseAnnotationList.template)
        this.annotationList = []
        this.emitter = options.eventEmitter || new EventEmitter()
        const defaultAnnotations = options.annotations || []
        defaultAnnotations.forEach(annotation => this.addAnnotation(annotation))

        this._setupEmitter()
    }

    addAnnotation(annotation) {
        const newAnnotation = this._createNewAnnotation(annotation)
        this.annotationList.push(newAnnotation)
        this.$instance.append(newAnnotation.$instance)
    }

    removeAnnotation(annotation) {
        const removeIndex = this.annotationList.findIndex(ele => ele.id == annotation.id)
        this.annotationList.splice(removeIndex, 1)
    }

    _createNewAnnotation() {
        throw new Error("concrete class should implement _createNewAnnotation function")
    }

    _setupEmitter() {
        // manipulates the list (adding or removing)
        this.emitter.on("segments.add", newAnnotations => { //? considered peaks dependency here
            newAnnotations.forEach(this.addAnnotation.bind(this))
        })
        this.emitter.on("annotations.remove", removedAnnotations => {
            removedAnnotations.forEach(this.removeAnnotation.bind(this))
        })
    }


    get $instance() {
        return this.$annotationList
    }

    destroy() {
        this.clear()
        this.$container.empty()
    }

    clear() {
        this.$instance.empty()
    }
}


module.exports = BaseAnnotationList