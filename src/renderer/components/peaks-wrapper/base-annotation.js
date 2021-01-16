const { EventEmitter } = require("events")


class BaseAnnotation {
    constructor(options, annotation) {
        if (!options.container) throw Error("should have container when init annotations list")
        this.$annotation = $(options.template)
        this.$container = $(options.container)
        this.eventEmitter = options.eventEmitter || new EventEmitter()
        this._setupEmitter()

        const $deleteButton = this.$instance.find("button.annotation-delete")
        $deleteButton.hide()
        this.$annotation.hover(e => $deleteButton.show(), e => $deleteButton.hide())
    }

    update(note) {
        // don't respond to other segments update for now, TODO: we may add here logic of updating time values so that
        // not to be collapsed
        if (!this.shouldUpdate(this.note, note)) return false

        // update time and color
        this.$instance.find(".color-rect").css({
            "background-color": note.color,
        })
        this.$instance.find(".time-start").text(Math.round(note.startTime))
        this.$instance.find(".time-end").text(Math.round(note.endTime))

        // save it as last instance of our data
        this._note = note
        return true
    }

    shouldUpdate(prevAnnotation, newAnnotation) {
        return prevAnnotation === undefined // first time init
            || prevAnnotation.id === newAnnotation.id // edit only when event is corresponding to the same annotation
    }

    _setupEmitter() {
        this.eventEmitter.on("segments.dragend", this.update.bind(this)) //? considered peaks dependency here
        this.$instance.find(".color-rect").click(e => {
            this.eventEmitter.emit("annotations.play", this._note)
        })
        this.$instance.find(".time-start").click(e => {
            this.eventEmitter.emit("annotations.stime-focus", this._note)
        })
        this.$instance.find(".time-end").click(e => {
            this.eventEmitter.emit("annotations.etime-focus", this._note)
        })
        this.$instance.find("button.annotation-delete").click(e => {
            this.eventEmitter.emit("annotations.remove", [this.note])
            this.$instance.remove()
        })
    }
    get $instance() {
        return this.$annotation
    }

    get note() {
        return this._note
    }
}

module.exports = BaseAnnotation