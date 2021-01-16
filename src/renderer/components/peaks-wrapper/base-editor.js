//@ts-ignore
const Peaks = require("peaks.js")


/**
 * Base class for visualizing and editing ProjectFile/Segment using Peaks.js class
 * this class is a wrapper for peaks.js
 * no other classes should know that we use peaks.js
 */
class BaseEditor {
    constructor(options) {
        this.options = options
        this._peaks = undefined
    }

    /**
     * Set current displayed file, remove current if any
     * @param {ProjectFile} file project file to display
     * @param {Object} options peaks options, overrides default options
     */
    setSource(options) {
        // remove old source and clear
        this.clear()

        // adjust options from defaults and so on...
        options = options || {}
        options = { ...this.options, ...options }
        options.dataUri = {
            arraybuffer: options.renderSrc
        }

        // playback adjusting
        const $audioContainer = $(options.mediaElement)
        $audioContainer.empty()
        $audioContainer.append(`<source src="${options.playbackSrc}" type="${options.playbackSrcType}">`)
        $audioContainer[0].load()

        // init peaks and save instance
        this._peaks = Peaks.init(options, (err, peaks) => {
            if (!err) {
                // so only update annotations after peaks get ready, and segments initialized inside it
                // and took colors
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
        this.annotationsList = this._createNewAnnotationsList(options)
        $(options.containers.annotationsview).append(this.annotationsList.$instance)
    }

    _createNewAnnotationsList() {
        throw Error("should implement _createNewAnnotationsList at concrete class")
    }

    /**
     * Adds peaks segment in the current zoomview
     */
    addSegmentHere(segmentUserData) {
        const { startTime, endTime } = this._zoomviewRange
        this.instance.segments.add({
            startTime, endTime, labelText: "inserted", editable: true, // TODO: get "inserted" text from quick dialog from user
            ...segmentUserData
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
        this.instance.on("annotations.update", ({ segment, newValues }) => {
            // if (newValues instanceof String)
            //     segment.update({ labelText: newValue })
            // else
                segment.update({ ...newValues })
        })
        this.instance.on("annotations.remove", removedSegments => {
            removedSegments.forEach(seg => this.instance.segments.removeById(seg.id))
        })
    }

    /**
     * Whether segments data have been changed or not
     */
    isEdited() {

    }

    clear() {
        if (this.instance) this.instance.destroy()
        if (this.annotationsList) this.annotationsList.destroy()
    }

    get instance() {
        return this._peaks
    }


    get _zoomviewRange() {
        const zoomview = this.instance.views.getView("zoomview")
        const startTime = zoomview.pixelsToTime(zoomview.getFrameOffset())
        const endTime = startTime + zoomview.pixelsToTime(zoomview.getWidth())
        return { startTime, endTime }
    }


}


module.exports = BaseEditor
