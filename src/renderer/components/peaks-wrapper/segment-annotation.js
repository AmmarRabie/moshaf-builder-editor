const BaseAnnotation = require("./base-annotation")


class SegmentAnnotation extends BaseAnnotation {

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
        
        <button class="annotation-delete btn btn-mini btn-negative">
            <span class="icon icon-cancel"></span>
        </button>
    </li>
    `
    constructor(options, segment) {
        // some sort of validation
        if (!options.container) throw Error("should have container when init chapter annotations list")

        // super init (basic default init)
        options.template = SegmentAnnotation.template
        super(options, segment)

        // first update (init)
        this.update(segment)
    }

    update(seg) {
        // update basic info
        const updated = super.update(seg)
        if (!updated) return updated

        // custom to mb segment
        this.$instance.find("#annotation-name").val(seg.labelText)
        this.$instance.find("#annotation-extra").val(seg.extraText || "")
    }

    _setupEmitter() {
        super._setupEmitter()
        const self = this
        this.$instance.find("input#annotation-name").change(function (e) {
            self.eventEmitter.emit("annotations.update", {
                segment: self.note,
                newValues: { labelText: $(this).val().toString() }
            })
        })
    }
}

module.exports = SegmentAnnotation