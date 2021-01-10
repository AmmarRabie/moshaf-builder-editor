

class Utils {
    /**
     * convert segments information to notes structure
     */
    static segmentsToNotes(segments) {
        return segments.map((segment, index) => {
            return {
                "begin": segment.start,
                "children": [],
                "end": segment.end,
                "id": "seg_" + index,
                "language": "eng",
                "lines": [
                    segment.name
                ]
            }
        })
    }

    static chaptersToNotes(segment) {
        const chapters = segment.chapters
        return chapters.map((chapter, index) => {
            const ayaObj = chapter.extras.best_aya
            return {
                "begin": chapter.globalStart - segment.start,
                "children": [],
                "end": chapter.globalEnd - segment.start,
                "id": "chap_" + index,
                "language": "eng",
                "lines": [
                    `${chapter.chapter}_${ayaObj.index} {${ayaObj.text}}`
                ]
            }
        })
    }
}


module.exports = Utils