const { CHAPTERS_ARABIC_NAMES, CHAPTERS } = require("./defaults")
const BaseAnnotation = require("./base-annotation")


class ChapterAnnotation extends BaseAnnotation {

    static template = `
    <li class="annotation">
        <span class="color-rect"></span>
        
        <span class="time-info">
            <span class="time-start">00:00:00</span>
            <span class="separator">--</span>
            <span class="time-end">00:00:00</span>
        </span>
        
        <select></select>
        <select></select>
        
        <button class="annotation-delete btn btn-mini btn-negative">
            <span class="icon icon-cancel"></span>
        </button>
    </li>
    `
    constructor(options, chapter) {
        // some sort of validation
        if (!options.container) throw Error("should have container when init chapter annotations list")

        // super init (basic default init)
        options.template = ChapterAnnotation.template
        super(options, chapter)

        // custom to chapter annotation, select inputs
        const $selects = this.$instance.find("select")
        ChapterAnnotation._inflateChapters($($selects[0]))
        $($selects[0]).on("change", function (e) {
            ChapterAnnotation._inflateAyat($($selects[1]), this.value)
        })

        this.update(chapter)
    }

    update(chap) {
        const updated = super.update(chap)
        if (!updated) return updated
        this.$chapterSelect.val(chap.chapter) // one-based
        ChapterAnnotation._inflateAyat(this.$ayatSelect, chap.chapter)
        this.$ayatSelect.val(chap.aya) // one-based
    }

    _setupEmitter() {
        super._setupEmitter()
        const self = this
        this.$chapterSelect.on("change", function (e) {
            self._emitUpdate($(this).val(), 1)
        })
        this.$ayatSelect.on("change", function (e) {
            self._emitUpdate(self.$chapterSelect.val(), $(this).val())
        })
    }

    _emitUpdate(sura, aya) {
        this.eventEmitter.emit("annotations.update", {
            segment: this.note,
            newValues: { labelText: sura.toString() + "_" + aya.toString() }
        })
    }

    static _inflateChapters($select) {
        for (let i = 0; i < CHAPTERS_ARABIC_NAMES.length; i++) {
            const chapterName = CHAPTERS_ARABIC_NAMES[i];
            $("<option>").val(i + 1).text(`${i + 1}. ${chapterName}`).appendTo($select)
        }
    }

    static _inflateAyat($select, chapterNum) {
        $select.empty()
        const targetChapter = CHAPTERS[chapterNum - 1] // zero based
        for (let i = 0; i < targetChapter.aya.length; i++) {
            const element = targetChapter.aya[i];
            let aya = element.ATTR.text
            if (aya.length > 50) aya = aya.slice(0, 37) + "..."
            $("<option>").val(i + 1).text(`${i + 1}. ${aya}`).appendTo($select)
        }
    }

    get $chapterSelect() {
        return $(this.$instance.find("select")[0])
    }

    get $ayatSelect() {
        return $(this.$instance.find("select")[1])
    }
}

module.exports = ChapterAnnotation