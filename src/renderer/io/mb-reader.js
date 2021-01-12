const fs = require("fs")

class MBReader {
    static readFile(inputPath) {
        const projectStr = fs.readFileSync(inputPath)
        const project = JSON.parse(projectStr).project
        return this.parseProject(project)
    }

    static parseProject(project) {
        return project // TODO: parse project into ProjectFile instance (see ProjectFile class in models)
    }
}


module.exports = MBReader