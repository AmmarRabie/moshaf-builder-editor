//@ts-ignore
const Peaks = require("peaks.js")
const { ProjectFile, Segment, Chapter } = require("../../../models")
const { projectFileOptions } = require("./defaults")
const SegmentAnnotationList = require("./segment-annotation-list")
const defaultOptions = projectFileOptions
const { EventEmitter } = require("events")


/**
 * class for visualizing and editing ProjectFile using Peaks.js class
 * this class is a wrapper for peaks.js
 * no other classes should know that we use peaks.js
 */
class ProjectFileEditor {
    constructor(options) {
        options = options || {}
        this.options = { ...defaultOptions, ...options }
        this._peaks = undefined
    }

    /**
     * Set current displayed file, remove current if any
     * @param {ProjectFile} file project file to display
     * @param {Object} options optional peaks options, overrides default options
     */
    setSource(file, options) {
        // remove old source and clear
        this.clear()

        // adjust options from defaults and so on...
        options = options || {}
        options = { ...this.options, ...options }
        options.dataUri = {
            arraybuffer: file.data_path
        }
        options.segments = file.segments.map(seg => ({
            startTime: seg.start,
            endTime: seg.end,
            editable: true,
            labelText: seg.name,
            ...seg
        }))

        // playback adjusting
        const $audioContainer = $(options.mediaElement)
        $audioContainer.empty()
        $audioContainer.append(`<source src="${file.path}" type="audio/wav">`)
        $audioContainer[0].load()

        // init peaks and save instance
        this._peaks = Peaks.init(options, (err, peaks) => {
            if (!err) {
                // so only update annotations after peaks get ready, and segments initialized inside it
                // and took colors
                console.log("will call init");
                this.initAnnotations({ ...options, segments: peaks.segments._segments })
            }
            else {
                console.log(err)
            }
        })

        // setup listeners and callbacks
        this._setupPeaksListeners()
    }

    initAnnotations(options) {
        // init annotations & add it to its container
        const segmentsList = new SegmentAnnotationList({
            container: options.containers.annotationsview,
            segments: options.segments,
            eventEmitter: this.instance // peaks itself is an event emitter object (inheritance)
        })

        $(options.containers.annotationsview).append(segmentsList.$instance)
        this.annotationsList = segmentsList
    }

    addSegment() {
        const zoomview = this.instance.views.getView("zoomview")
        const startTime = zoomview.pixelsToTime(zoomview.getFrameOffset())
        const endTime = startTime + zoomview.pixelsToTime(zoomview.getWidth())
        this.instance.segments.add({
            startTime, endTime, labelText: "inserted", editable: true
        })
    }


    _setupPeaksListeners() {
        // straightforward implementation using peaks API features
        this.instance.on("annotations.play", (segment) => {
            this.instance.player.playSegment(segment)
        })
        this.instance.on("annotations.stime-focus", (segment) => {
            this.instance.views.getView("zoomview").setStartTime(segment.startTime)
        })
        this.instance.on("annotations.etime-focus", (segment) => {
            this.instance.views.getView("zoomview").setStartTime(segment.endTime)
        })
        this.instance.on("annotations.update", ({ segment, newValue }) => {
            segment.update({ labelText: newValue })
        })
    }

    /**
     * Whether segments data have been changed or not
     */
    isEdited() {

    }

    clear() {
        if (this.instance) this.instance.destroy()
        if(this.annotationsList) this.annotationsList.destroy()
    }

    get instance() {
        return this._peaks
    }


}


module.exports = ProjectFileEditor
