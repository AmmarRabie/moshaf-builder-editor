const WaveformPlaylist = require("waveform-playlist")
const path = require("path")
const fs = require("fs")
const { dialog } = require('electron').remote
console.log(dialog)

const ViewList = require("./components/view-list")
const PlaylistWrapper = require("./components/playlist-wrapper")
const Utils = require("./utils")


var EditorMain = (function ($) {
  'use strict';

  var App = {},
    DOMDfd = $.Deferred(),
    $body = $('body'),
    $doc = $(document);

  App.modules = {};
  App.helpers = {};
  App._localCache = {};

  App.playlist = NaN;

  App.CONSTANT_VARIABLE = 0

  App.afterDOMReady = function () {
    var self = this;


    $("#btn-open-project-file").on("click", e => {
      const filePaths = dialog.showOpenDialogSync({filters: [{name: "moshaf-builder projcet file", extensions: ["mb", "json"]}]})
      if(filePaths === undefined) return
      console.log(filePaths, "chosen");
      const mbFilePath = filePaths[0]
      this.loadProject(mbFilePath)
      $("#project-path").text(mbFilePath)
    });

    $("#btn-pause").on("click", e => {
      if(!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.pause()
    })
    $("#btn-stop").on("click", e => {
      if(!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.stop()
    })
    $("#btn-play").on("click", e => {
      if(!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.play()
    })

    $("#btn-add-note").on("click", e => {
      if(!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.addNote()
    })
    $("#btn-set-edge").on("click", e => {
      if(!this.currentPlaylistWrapper) return
      this.currentPlaylistWrapper.setEdge()
    })
  }

  App.loadProject = function (projectPath = "./tmp.mb") {
    
    this.project = JSON.parse(fs.readFileSync(projectPath).toString()).project
    
    const $ulContainer = $("#view-list-container")
    if(this.filesList) filesList.clear()
    const filesList = new ViewList({container: $ulContainer})
    for (let file of this.project.files){
      const currentPath = file.path
      const name = path.basename(currentPath)
      filesList.add("../assets/audio-file.png", name, currentPath)
    }
    filesList.select(0)
    filesList.addItemClickListener((e, index) => this.onFileSelected(e, index))
    this.filesList = filesList
  }

  App.onFileSelected =  function (e, index) {    
    const selectedFile = this.project.files[index]
    console.log(selectedFile, "selected from view list");
    this.filesList.select(index)

    if(this.currentPlaylistWrapper){
      this.currentPlaylistWrapper.clear()
    }
    this.currentPlaylistWrapper = new PlaylistWrapper({
      container: "#playlist",
      file: selectedFile
    })
  }


  $doc.ready(function () {
    App.afterDOMReady();
    if (window.fill) window.fill()
  });

  return App;

})(window.jQuery);
