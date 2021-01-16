const fs = require("fs")
const path = require("path")

const defaultOptions = {
    containers: {
        overview: document.getElementById('overview-container'),
        zoomview: document.getElementById('zoomview-container'),
        annotationsview: document.getElementById('annotations-container')
    },
    mediaElement: document.querySelector('audio'),

    // If true, Peaks.js will send credentials with all network requests,
    // i.e., when fetching waveform data.
    withCredentials: false,

    // async logging function
    logger: console.error.bind(console),

    // if true, emit cue events on the Peaks instance (see Cue Events)
    emitCueEvents: false,

    // default height of the waveform canvases in pixels
    height: 200,

    // Array of zoom levels in samples per pixel (big >> small)
    zoomLevels: [512, 1024, 2048, 4096],

    // Bind keyboard controls
    keyboard: false,

    // Keyboard nudge increment in seconds (left arrow/right arrow)
    nudgeIncrement: 0.01,

    // Color for segment start marker handles
    segmentStartMarkerColor: '#a0a0a0',

    // Color for segment end marker handles
    segmentEndMarkerColor: '#a0a0a0',

    // Color for the zoomable waveform
    // zoomWaveformColor: 'rgba(0, 225, 128, 1)', // green
    zoomWaveformColor: 'rgba(0,0,0,0.2)',

    // Color for the overview waveform
    overviewWaveformColor: 'rgba(0,0,0,0.2)',

    // Color for the overview waveform rectangle
    // that shows what the zoomable view shows
    overviewHighlightColor: 'grey',

    // The default number of pixels from the top and bottom of the canvas
    // that the overviewHighlight takes up
    overviewHighlightOffset: 20, // default is 11

    // Color for segments on the waveform
    segmentColor: 'rgba(255, 161, 39, 1)',

    // Color of the play head
    playheadColor: 'rgba(0, 0, 0, 1)',

    // Color of the play head text
    playheadTextColor: '#aaa',

    // Precision of time label of play head and point/segment markers
    timeLabelPrecision: 2,

    // Show current time next to the play head
    // (zoom view only)
    showPlayheadTime: false,

    // the color of a point marker
    pointMarkerColor: '#FF0000',

    // Color of the axis gridlines
    axisGridlineColor: '#ccc',

    // Color of the axis labels
    axisLabelColor: '#aaa',

    // Random color per segment (overrides segmentColor)
    randomizeSegmentColor: true,

    // Font family for axis labels, playhead, and point and segment markers
    fontFamily: 'sans-serif',

    // Font size for axis labels, playhead, and point and segment markers
    fontSize: 13,

    // Font style for axis labels, playhead, and point and segment markers
    // (either 'normal', 'bold', or 'italic')
    fontStyle: 'normal',

    // Array of initial segment objects with startTime and
    // endTime in seconds and a boolean for editable.
    // See below.
    // segments: [{
    //     startTime: 120,
    //     endTime: 140,
    //     editable: true,
    //     color: "#ff0000",
    //     labelText: "My label"
    // },
    // {
    //     startTime: 220,
    //     endTime: 240,
    //     editable: false,
    //     color: "#00ff00",
    //     labelText: "My Second label"
    // }],

    // // Array of initial point objects
    // points: [{
    //     time: 150,
    //     editable: true,
    //     color: "#00ff00",
    //     labelText: "A point"
    // },
    // {
    //     time: 160,
    //     editable: true,
    //     color: "#00ff00",
    //     labelText: "Another point"
    // }]
}

const CHAPTERS_ARABIC_NAMES = [
    "الفاتحة",
    "البقرة",
    "آل عمران",
    "النساء",
    "المائدة",
    "الأنعام",
    "الأعراف",
    "الأنفال",
    "التوبة",
    "يونس",
    "هود",
    "يوسف",
    "الرعد",
    "إبراهيم",
    "الحجر",
    "النحل",
    "الإسراء",
    "الكهف",
    "مريم",
    "طه",
    "الأنبياء",
    "الحج",
    "المؤمنون",
    "النور",
    "الفرقان",
    "الشعراء",
    "النمل",
    "القصص",
    "العنكبوت",
    "الروم",
    "لقمان",
    "السجدة",
    "الأحزاب",
    "سبأ",
    "فاطر",
    "يس",
    "الصافات",
    "ص",
    "الزمر",
    "غافر",
    "فصلت",
    "الشورى",
    "الزخرف",
    "الدخان",
    "الجاثية",
    "الأحقاف",
    "محمد",
    "الفتح",
    "الحجرات",
    "ق",
    "الذاريات",
    "الطور",
    "النجم",
    "القمر",
    "الرحمن",
    "الواقعة",
    "الحديد",
    "المجادلة",
    "الحشر",
    "الممتحنة",
    "الصف",
    "الجمعة",
    "المنافقون",
    "التغابن",
    "الطلاق",
    "التحريم",
    "الملك",
    "القلم",
    "الحاقة",
    "المعارج",
    "نوح",
    "الجن",
    "المزمل",
    "المدثر",
    "القيامة",
    "الإنسان",
    "المرسلات",
    "النبأ",
    "النازعات",
    "عبس",
    "التكوير",
    "الانفطار",
    "المطففين",
    "الانشقاق",
    "البروج",
    "الطارق",
    "الأعلى",
    "الغاشية",
    "الفجر",
    "البلد",
    "الشمس",
    "الليل",
    "الضحى",
    "الشرح",
    "التين",
    "العلق",
    "القدر",
    "البينة",
    "الزلزلة",
    "العاديات",
    "القارعة",
    "التكاثر",
    "العصر",
    "الهمزة",
    "الفيل",
    "قريش",
    "الماعون",
    "الكوثر",
    "الكافرون",
    "النصر",
    "المسد",
    "الإخلاص",
    "الفلق",
    "الناس",
]


let CHAPTERS = fs.readFileSync(path.join(__dirname, "/../../../../assets/quran-simple-clean.json"));
CHAPTERS = JSON.parse(CHAPTERS).quran.sura


module.exports = {
    projectFileOptions: defaultOptions,
    chapterOptions: defaultOptions,
    CHAPTERS_ARABIC_NAMES,
    CHAPTERS
}