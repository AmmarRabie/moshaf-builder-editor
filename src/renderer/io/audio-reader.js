// This file is just a wrapper class to hide complexity of all ffmpeg features
// Define interface for the application to read sounds from
// In future, we may use less dependencies and remove fluent-ffmpeg and use other methods

const ffmpeg = require("fluent-ffmpeg")
const stream = require("stream")
const streamToArray = require("stream-to-array")
const util = require("util")

class AudioFileReader {

    constructor(baseDir = "./", defaultOutFormat = "wav") {
        this.baseDir = baseDir || "./"
        this.defaultOutFormat = defaultOutFormat || "wav"
    }

    /**
     * 
     * @param {string | stream.Readable} input input
     * @param {int} start seconds to start read from
     * @param {int} end seconds to end read on
     */
    static async readRange(input, start, end) {
        const cmd = ffmpeg(input).
            setStartTime(start).
            duration(end - start).
            format("wav")
        // TODO error catching
        const ffstream = cmd.pipe() // returns Pass-Through
        const parts = await streamToArray(ffstream)
        const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part));
        console.log(buffers.length)
        const b = new Blob(parts, {'type': 'audio'})
        console.log(b.size)
        return b;
    }
}


module.exports = AudioFileReader

