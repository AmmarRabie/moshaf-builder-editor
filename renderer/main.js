const path = require("path")
const fs = require("fs")

const { dialog } = require('electron').remote
const ffmpeg = require("fluent-ffmpeg")

const ViewList = require("./components/view-list")
const { SegmentsPlaylist, ChaptersPlaylist } = require("./components/playlist-wrapper")
const AudioFileReader = require("./io/audio-reader")


const testPath = "C:\\Data\\alquran kamel\\01\\ZOOM0001.WAV"
const s = Math.round(1314.795867)
const e = Math.round(1758.212556)
const command = ffmpeg(testPath).seekInput(s).duration(e - s).format("wav"); //.saveToFile("node.101.wav");
command.on('start', function (commandLine) {
  console.log('Spawned Ffmpeg with command: ' + commandLine);
})
command.on('end', function () {
  console.log('end processing ');
})

class EditorMain {

  constructor() {
    this.isChapterView = false // init with segments editing scenario
    this.project = null
    this.currentPlaylistWrapper = null
    this.filesList = null
    this.segmentsList = null
  }

  init() {
    var self = this;
    $("#btn-open-project-file").on("click", e => {
      const filePaths = dialog.showOpenDialogSync({ filters: [{ name: "moshaf-builder projcet file", extensions: ["mb", "json"] }] })
      if (filePaths === undefined) return
      console.log(filePaths, "chosen");
      const mbFilePath = filePaths[0]
      this.loadProject(mbFilePath)
      $("#project-path").text(mbFilePath)
    });

    $("input#chapter-select").on("input", function (e) {
      console.log(this.checked);
      self.isChapterView = this.checked
      if (this.checked) self.onChapterView()
      else self.onSegmentView()
    })

    $("#btn-pause").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.pause()
    })
    $("#btn-stop").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.stop()
    })
    $("#btn-play").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.play()
    })

    $("#btn-add-note").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.addNote()
    })
    $("#btn-set-edge").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.setEdge()
    })

    $("#btn-zoomin").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.zoom_in()
    })
    $("#btn-zoomout").on("click", e => {
      if (!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.zoom_out()
    })

    $("input#volume-gain").on("input", function (e) {
      if (!self.currentPlaylistWrapper) return
      self.currentPlaylistWrapper.setVolume(this.value)
    })
    this.loadProject()
  }

  loadProject(projectPath = "./tmp.mb") {

    if (this.project) {
      // TODO: consider asking for saving if there is a changes
    }
    this.project = JSON.parse(fs.readFileSync(projectPath).toString()).project

    this.filesList = this._newFilesList(this.project.files)
    this.filesList.select(0) // don't call onFileSelected
    this.selectedFileIndex = 0 // because we don't want to load playlist till he click
  }


  onFileSelected(e, index) {
    this.selectedFileIndex = index
    this.filesList.select(index)

    console.log(this.selectedFile, "selected from view list");

    if (this.isChapterView) { // chapters of a segment editing scenario
      // inflate segments list of current file
      this.segmentsList = this._newSegmentsList(this.selectedFile)
    }
    else { // segments of an audio file editing scenario
      // inflate the playlist of current file
      this.currentPlaylistWrapper && this.currentPlaylistWrapper.clear()
      this.currentPlaylistWrapper = new SegmentsPlaylist({
        container: "#playlist",
        file: this.selectedFile
      })
    }
  }

  async onSegmentSelected(e, index) {
    this.selectedSegIndex = index
    this.segmentsList.select(index)

    console.log("selecting segment: ", this.selectedSeg)
    // console.log(buf.length);
    this.currentPlaylistWrapper && this.currentPlaylistWrapper.clear()
    this.currentPlaylistWrapper = await ChaptersPlaylist.fromFileAndSeg({
      file: this.selectedFile,
      segment: this.selectedSeg,
      container: "#playlist"
    })
  }

  onChapterView() {
    // on user request to change view to chapter
    // show list of files, list of segments, chapters of a segment editing in the main
    this.segmentsList = this._newSegmentsList(this.selectedFile)
  }
  onSegmentView() {
    // on user request to change view to segments
    // show list of files, segments of a file editing in the main
    this.segmentsList.clear()
    this.filesList.select(-1) // removes all selection
  }

  _newFilesList(list, container = "#view-list-container", imgPath = path.join(__dirname, "../assets/audio-file.png")) {
    this.filesList && this.filesList.clear()
    const viewList = this._newListView(container, imgPath, list, t => path.basename(t.path), t => t.path)
    viewList.addItemClickListener((e, index) => this.onFileSelected(e, index))
    return viewList
  }

  _newSegmentsList(file, container = "#view-list-container-below", imgPath = path.join(__dirname, "../assets/scissors.png")) {
    this.segmentsList && this.segmentsList.clear()
    const fileName = path.basename(file.path)
    const viewList = this._newListView(container, imgPath, file.segments, t => t.name, _ => fileName)
    viewList.addItemClickListener((e, index) => this.onSegmentSelected(e, index))
    return viewList
  }

  _newListView(container, imgPath, list, getTitle, getDesc) {
    const listView = new ViewList({ container: container })
    for (let item of list) {
      listView.add(imgPath, getTitle(item), getDesc(item))
    }
    return listView
  }

  // getters
  get selectedFile() {
    if (!this.project || !this.project.files) return "sd"
    return this.project.files[this.selectedFileIndex]
  }
  get selectedSeg() {
    if (!this.project || !this.project.files) return "sd"
    return this.selectedFile.segments[this.selectedSegIndex]
  }
}


let $doc = $(document);
let editorMain = new EditorMain()
$doc.ready(function () {
  editorMain.init()
  if (window.fill) window.fill()
});
