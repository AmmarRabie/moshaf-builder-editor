const path = require("path")
const fs = require("fs")

const { ProjectFileEditor, ChapterEditor } = require("./components/peaks-wrapper")

const { dialog } = require('electron').remote

const ViewList = require("./components/view-list")

class EditorMain {

  constructor() {
    this.isChapterView = false // init with segments editing scenario
    this.project = null
    this.currentPlaylistWrapper = null
    this.filesList = null
    this.segmentsList = null
    this.projectFileEditor = new ProjectFileEditor()
    this.chapterEditor = new ChapterEditor()
  }

  init() {
    var self = this;
    // add button listeners
    $("#btn-zoomin").on("click", e => {
      this.currentEditor && this.currentEditor.instance.zoom.zoomIn()
    })
    $("#btn-zoomout").on("click", e => {
      this.currentEditor && this.currentEditor.instance.zoom.zoomOut()
    })

    $("#btn-pause").on("click", e => {
      this.currentEditor && this.currentEditor.instance.player.pause();
    })
    $("#btn-stop").on("click", e => {
      if (!this.currentEditor) return
      const peaks = this.currentEditor.instance
      const zoomview = peaks.views.getView("zoomview");
      const persistFrame = zoomview.getFrameOffset()
      peaks.player.pause()
      peaks.player.seek(0)
      console.log(persistFrame);
      setTimeout(() => zoomview._updateWaveform(persistFrame), 100)
    })
    $("#btn-play").on("click", e => {
      this.currentEditor && this.currentEditor.instance.player.play();
    })


    $("#btn-open-project-file").on("click", e => {
      const filePaths = dialog.showOpenDialogSync({ filters: [{ name: "moshaf-builder projcet file", extensions: ["mb", "json"] }] })
      if (filePaths === undefined) return
      console.log(filePaths, "chosen");
      const mbFilePath = filePaths[0]
      this.loadProject(mbFilePath)
    });
    $("#btn-update").on("click", function (e) {
      self.onUpdateClick()
    })
    $("#btn-save").on("click", function (e) {
      self.onUpdateClick()
      self.saveProject()
    })

    $("input#chapter-select").on("input", function (e) {
      console.log(this.checked);
      self.isChapterView = this.checked
      if (this.checked) self.onChapterView()
      else self.onSegmentView()
    })



    $("#btn-add-note").on("click", e => {
      this.currentEditor && this.currentEditor.addSegmentHere()
    })

    this.loadProject() // TODO: remove auto open project
  }

  loadProject(projectPath) {
    projectPath = projectPath || "./tmp.mb"
    if (this.project) {
      // TODO: consider asking for saving if there is a changes
      this.currentEditor && this.currentEditor.clear()
      this.segmentsList && this.segmentsList.clear()
      this.filesList && this.filesList.clear()
    }
    this.project = JSON.parse(fs.readFileSync(projectPath).toString()).project

    this.filesList = this._newFilesList(this.project.files)
    this.onFileSelected(null, 0)
    $("#project-path").text(projectPath)
  }

  saveProject(outPath) {
    outPath = outPath || "./tmp.edited.mb"
    if (!this.project) {
      // TODO: alert
      return
    }
    console.log(this);
    const jsonStr = JSON.stringify({ project: this.project })

    fs.writeFile(outPath, jsonStr, "utf8", err => console.log(err))
  }

  onFileSelected(e, index) {
    this.selectedFileIndex = index
    this.filesList.select(index)

    console.log(this.selectedFile, "selected from view list");

    if (this.isChapterView) { // chapters of a segment editing scenario
      // inflate segments list of current file
      this.segmentsList = this._newSegmentsList(this.selectedFile)
      this.onSegmentSelected(null, 0)
    }
    else { // segments of an audio file editing scenario
      // inflate the playlist of current file
      this.projectFileEditor.setSource(this.selectedFile)
    }
  }

  onSegmentSelected(e, index) {
    this.selectedSegIndex = index
    this.segmentsList.select(index)

    console.log("selecting segment: ", this.selectedSeg)
    this.projectFileEditor.clear()
    this.chapterEditor.setSource(this.selectedFile, this.selectedSeg)
  }

  onChapterView() {
    // on user request to change view to chapter
    // show list of files, list of segments, chapters of a segment editing in the main
    this.segmentsList = this._newSegmentsList(this.selectedFile)
    if (this.selectedFile)
      this.onSegmentSelected(null, 0)
    // validateSegmentsDatFiles()
  }
  onSegmentView() {
    // on user request to change view to segments
    // show list of files, segments of a file editing in the main
    this.segmentsList.clear()
    this.onFileSelected(null, 0)
  }

  onUpdateClick() {
    if (!this.selectedFile) return // no files, no segments selected => save what !
    if (this.isChapterView && this.selectedSeg) {
      // save current chapters information
      this._updateSelectedSegment()
    }
    else if (!this.isChapterView) {
      // save current segments information
      this._updateSelectedFile()
    }
  }

  _updateSelectedSegment() {
    const newChapters = this.currentEditor.instance.segments.getSegments() // TODO: don't use peaks methods here, use annotationsList instead
    this.selectedSeg.chapters = newChapters.map(newChap => {
      const labelParts = newChap.labelText.split("_")
      const sura = +labelParts[0]
      const aya = +labelParts[1]
      if (newChap.extras) {
        newChap.extras.best_aya.index = aya
        newChap.extras.best_aya.sura = sura
      }
      else {
        newChap.extras = { best_aya: { index: aya, sura: sura } }
      }
      return {
        // may be updated, get from the editor
        globalStart: newChap.startTime,
        globalEnd: newChap.endTime,
        chapter: sura,
        aya,

        // old date, it is also in the newChap.. TODO: match with name(or may add field ID) and use ...old for better modularity
        extras: newChap.extras || false, // false so that act like not set
        processed: newChap.processed || false,

        manual: true // save info that this piece is edited from the user
      }
    })
  }

  _updateSelectedFile() {
    const newSegments = this.currentEditor.instance.segments.getSegments() // TODO: don't use peaks methods here, use annotationsList instead
    this.selectedFile.segments = newSegments.map(newSeg => {
      return {
        // may be updated, get from the editor
        start: newSeg.startTime,
        end: newSeg.endTime,
        name: newSeg.labelText,

        // old date, it is also in the newSeg.. TODO: match with name(or may add field ID) and use ...old for better modularity
        chapters: newSeg.chapters || [],
        processed: newSeg.processed || false,

        manual: true // save info that this piece is edited from the user
      }
    })
  }

  _newFilesList(list, container = "#view-list-container", imgPath = path.join(__dirname, "../../assets/audio-file.png")) {
    this.filesList && this.filesList.clear()
    const viewList = this._newListView(container, imgPath, list, t => path.basename(t.path), t => t.path)
    viewList.setItemClickListener((e, index) => this.onFileSelected(e, index))
    return viewList
  }

  _newSegmentsList(file, container = "#view-list-container-below", imgPath = path.join(__dirname, "../../assets/scissors.png")) {
    this.segmentsList && this.segmentsList.clear()
    const fileName = path.basename(file.path)
    const viewList = this._newListView(container, imgPath, file.segments, t => t.name, _ => fileName)
    viewList.setItemClickListener((e, index) => this.onSegmentSelected(e, index))
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
    if (!this.project || !this.project.files) return null
    return this.project.files[this.selectedFileIndex]
  }
  get selectedSeg() {
    if (!this.project || !this.project.files) return "sd"
    return this.selectedFile.segments[this.selectedSegIndex]
  }
  get currentEditor() {
    if (this.isChapterView) {
      return this.chapterEditor
    }
    return this.projectFileEditor
  }
}


let $doc = $(document);
let editorMain = new EditorMain()
$doc.ready(function () {
  editorMain.init()
  if (window.fill) window.fill()
});
