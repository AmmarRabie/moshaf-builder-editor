//@ts-ignore
const { ProjectFile, Segment, Chapter } = require("../../../models")
const { projectFileOptions } = require("./defaults")
const SegmentAnnotationList = require("./segment-annotation-list")
const defaultOptions = projectFileOptions
const BaseEditor = require("./base-editor")


/**
 * class for visualizing and editing ProjectFile using Peaks.js class
 * this class is a wrapper for peaks.js
 * no other classes should know that we use peaks.js
 */
class ProjectFileEditor extends BaseEditor {
    constructor(options) {
        options = options || {}
        options = { ...defaultOptions, ...options }
        super(options)
    }

    /**
     * Set current displayed file, remove current if any
     * @param {ProjectFile} file project file to display
     * @param {Object} options optional peaks options, overrides default options
     */
    setSource(file, options) {
        // adjust options from defaults and so on...
        options = options || {}
        options.playbackSrc = file.path
        options.playbackSrcType = "audio/wav"
        options.renderSrc = file.data_path
        options.segments = file.segments.map(seg => ({
            startTime: seg.start,
            endTime: seg.end,
            editable: true,
            labelText: seg.name,
            ...seg
        }))
        super.setSource(options)
    }

    /**
     * Adds segment in the current zoomview
     */
    addSegmentHere() {
        super.addSegmentHere({
            labelText: "inserted"
        })
    }

    _createNewAnnotationsList(options) {
        return new SegmentAnnotationList({
            container: options.containers.annotationsview,
            annotations: options.segments,
            eventEmitter: this.instance // peaks itself is an event emitter object (inheritance)
        })
    }
}


module.exports = ProjectFileEditor
