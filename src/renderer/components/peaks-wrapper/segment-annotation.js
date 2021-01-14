const { EventEmitter } = require("events")


class SegmentAnnotation {

    static template = `
    <li class="annotation">
        <span class="color-rect"></span>
        
        <span class="time-info">
        <span class="time-start">00:00:00</span>
        <span class="separator">--</span>
        <span class="time-end">00:00:00</span>
        </span>
        
        <input required id="annotation-name" placeholder="Enter segment name" type="text">
        <input id="annotation-extra" placeholder="Optional extra info or hints" type="text">
        
        <button class="btn btn-mini btn-negative">
            <span class="icon icon-cancel"></span>
        </button>
    </li>
    `
    constructor(options, segment) {
        if (!options.container) throw Error("should have container when init segment annotations list")
        this.$annotation = $(SegmentAnnotation.template)
        this.$container = $(options.container)
        this.eventEmitter = options.eventEmitter || new EventEmitter()
        this.update(segment)
        this._setupEmitter()

        this.$annotation.hover(e => this.$instance.find("button").show(), e => this.$instance.find("button").hide())
    }

    update(seg) {
        // don't respond to other segments update for now, TODO: we may add here logic of updating time values so that
        // not to be collapsed
        if (this._segment !== undefined && this._segment.id !== seg.id) return

        this.$instance.find(".color-rect").css({
            "background-color": seg.color,
        })
        this.$instance.find(".time-start").text(seg.startTime)
        this.$instance.find(".time-end").text(seg.endTime)
        this.$instance.find("#annotation-name").val(seg.labelText)
        this.$instance.find("#annotation-extra").val(seg.extraText || "")
        this._segment = seg
    }

    _setupEmitter() {
        const self = this
        this.eventEmitter.on("segments.dragend", this.update.bind(this)) //? considered peaks dependency here
        this.$instance.find(".color-rect").click(e => {
            this.eventEmitter.emit("annotations.play", this._segment)
        })
        this.$instance.find(".time-start").click(e => {
            this.eventEmitter.emit("annotations.stime-focus", this._segment)
        })
        this.$instance.find(".time-end").click(e => {
            this.eventEmitter.emit("annotations.etime-focus", this._segment)
        })
        this.$instance.find("#annotation-name").change(function (e) {
            self.eventEmitter.emit("annotations.update", {
                segment: self.segment,
                newValue: $(this).val()
            })
        })
        this.$instance.find("button").click(function (e) {
            self.eventEmitter.emit("segments.remove", [self.segment]) //? considered peaks dependency here
            self.$instance.remove()
        })
    }
    get $instance() {
        return this.$annotation
    }

    get segment(){
        return this._segment
    }
}

module.exports = SegmentAnnotation