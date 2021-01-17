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
    setSource(file, segment, options) {
        options = options || {}
        options.playbackSrc = file.path
        options.playbackSrcType = "audio/wav"

        //# setting renderer source
        //## slicing the data and resemble it again (what to do if segment is too small.. we have to regenerate the data again!)
        //? should we implement it ?!

        //## if we can store segment data alone and regenerate it when changed (audiowaveform.exe doesn't support it directly)
        //? should implement ?!

        //## render the whole file, with blocking editing outside segment
        //? (should block navigation also)
        options.renderSrc = file.data_path
        options.segments = segment.chapters.map(chap => ({
            startTime: chap.globalStart,
            endTime: chap.globalEnd,
            editable: true,
            labelText: String(chap.chapter) + "_" + String(chap.extras.best_aya.index),
            aya: chap.extras.best_aya.index,
            ...chap
        }))

        // add boundaries
        options.boundaries = {
            start: segment.start,
            end: segment.end
        }
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
        return super.addSegmentHere({
            chapter: 1,
            aya: 1,
        })
    }

}


module.exports = ChapterEditor
