

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
}


module.exports = Utils