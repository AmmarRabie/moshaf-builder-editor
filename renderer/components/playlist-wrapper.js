const Utils = require("../utils")
const WaveformPlaylist = require("waveform-playlist")

const defaultActions = [
  {
    class: 'fa.fa-minus',
    title: 'Reduce annotation end by 0.010s',
    action: (annotation, i, annotations, opts) => {
      var next;
      var delta = 0.010;
      annotation.end -= delta;

      if (opts.linkEndpoints) {
        next = annotations[i + 1];
        next && (next.start -= delta);
      }
    }
  },
  {
    class: 'fa.fa-plus',
    title: 'Increase annotation end by 0.010s',
    action: (annotation, i, annotations, opts) => {
      var next;
      var delta = 0.010;
      annotation.end += delta;

      if (opts.linkEndpoints) {
        next = annotations[i + 1];
        next && (next.start += delta);
      }
    }
  },
  {
    class: 'fa.fa-scissors',
    title: 'Split annotation in half',
    action: (annotation, i, annotations) => {
      const halfDuration = (annotation.end - annotation.start) / 2;
      console.log(annotation);
      const { id } = annotation
      let firstDigitIndex = 0;
      for (firstDigitIndex in id) {
        if (+id[firstDigitIndex] == id[firstDigitIndex]) break
      }
      const nextNumStr = String(+id.slice(firstDigitIndex) + 1)
      const zeros = "0".repeat(id.length - firstDigitIndex - nextNumStr.length)
      const newId = id.slice(0, firstDigitIndex) + zeros + nextNumStr
      annotations.splice(i + 1, 0, {
        id: newId,
        start: annotation.end - halfDuration,
        end: annotation.end,
        lines: nextNumStr,
        lang: 'en',
      });

      annotation.end = annotation.start + halfDuration;
    }
  },
  {
    class: 'fa.fa-trash',
    title: 'Delete annotation',
    action: (annotation, i, annotations) => {
      annotations.splice(i, 1);
    }
  }
];

const defaultConfig = {
    samplesPerPixel: 7000,
    mono: true,
    waveHeight: 150,
    // container: document.getElementById("playlist"),

    state: "cursor", // (cursor | select | fadein | fadeout | shift)

    // (line | fill)
    seekStyle: "line",

    // Whether to automatically scroll the waveform while playing
    isAutomaticScroll: false,

    colors: {
        // waveOutlineColor: "#E0EFF1",
        waveOutlineColor: "#006699",
        timeColor: "grey",
        fadeColor: "black"
    },

    timescale: true,

    controls: {
        show: false,
        width: 150
    },
    zoomLevels: [500, 1000, 3000, 5000, 7000, 10000],

    annotationList: {
        // Array of annotations in [Aeneas](https://github.com/readbeyond/aeneas) JSON format
        annotations: [],

        // Whether the annotation texts will be in updateable contenteditable html elements
        editable: true,

        // User defined functions which can manipulate the loaded annotations
        controls: defaultActions,

        // If false when clicking an annotation id segment
        // playback will stop after segment completion.
        isContinuousPlay: false,

        // If true annotation endpoints will remain linked when dragged
        // if they were the same value before dragging started.
        linkEndpoints: true
    }
}

/**
 * playlist with annotations wrapper for waveform-playlist
 */
class PlaylistWrapper {
    /**
     * 
     * @param {Object} config require file and container
     */
    constructor(config) {
        this.$container = $(config.container)
        this.file = config.file
        this.src = this.file.path
        this.config = {...defaultConfig, ...config}

        // add dynamic config data (annotations and container)
        this.config.annotationList.annotations = Utils.segmentsToNotes(this.file.segments)
        this.config.container = document.getElementById("playlist")
        delete this.config.file
        console.log(this.config);
        

        // init and load the playlist
        this.playlist = WaveformPlaylist.init(this.config)
        this.loaded = false
        this.playlist.load([{
            src: this.src,
            name: "segment",
            gain: 1
        }]).then(() => {
            this.loaded = true
        })
    }

    clear(){
        const ee = this.playlist.getEventEmitter()
        ee.emit("clear")
        this.$container.html('')
    }


    

}


module.exports = PlaylistWrapper