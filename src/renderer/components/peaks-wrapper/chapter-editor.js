//@ts-ignore
const { ProjectFile, Segment, Chapter } = require("../../../models")
const { chapterOptions } = require("./defaults")
const ChapterAnnotationList = require("./chapter-annotation-list")
const defaultOptions = chapterOptions
const BaseEditor = require("./base-editor")


/**
 * class for visualizing and editing ProjectFile using Peaks.js class
 * this class is a wrapper for peaks.js
 * no other classes should know that we use peaks.js
 */
class ChapterEditor extends BaseEditor {
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
        options = options || {}
        options.playbackSrc = file.path
        options.playbackSrcType = "audio/wav"
        options.renderSrc = file.data_path
        options.segments = file.segments[0].chapters.map(chap => ({
            startTime: chap.globalStart,
            endTime: chap.globalEnd,
            editable: true,
            labelText: String(chap.chapter) + "_" + String(chap.extras.best_aya.index),
            aya: chap.extras.best_aya.index,
            ...chap
        }))
        super.setSource(options)
    }



    _createNewAnnotationsList(options) {
        return new ChapterAnnotationList({
            container: options.containers.annotationsview,
            annotations: options.segments,
            eventEmitter: this.instance // peaks itself is an event emitter object (inheritance)
        })
    }


    addSegmentHere() {
        super.addSegmentHere({
            chapter: 1,
            aya: 1,
        })
    }

}


module.exports = ChapterEditor
