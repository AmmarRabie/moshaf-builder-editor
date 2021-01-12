//@ts-ignore
const Peaks = require("peaks.js")
const { ProjectFile, Segment, Chapter } = require("../../../models")
const { projectFileOptions } = require("./defaults")
const defaultOptions = projectFileOptions


/**
 * class for visualizing and editing ProjectFile using Peaks.js class
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
        this.clear()
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
        }))
        this._peaks = Peaks.init(options, (err, peaks) => {
            if (!err) return
            console.log(err)
        })
    }

    /**
     * Whether segments data have been changed or not
     */
    isEdited() {

    }

    clear() {
        if (this.instance) this.instance.destroy()
    }

    get instance() {
        return this._peaks
    }


}


module.exports = ProjectFileEditor
