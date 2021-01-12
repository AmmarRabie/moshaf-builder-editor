

class ViewList {
    constructor(config){
        this.$container = $(config.container)
        this.width = config.width || 32
        this.height = config.height || 32
    }

    get testGet() {
        console.log(this);
    }

    add(imgPath, title, desc) {
        const $currentListItem = $(`
            <li class="list-group-item">
                <img class="media-object pull-left" src="${imgPath}" width="${this.width}" height="${this.height}">
                <div class="media-body">
                    <strong>${title}</strong>
                    <p>${desc}</p>
                </div>
            </li>
      `)
      this.$container.append($currentListItem)
      // TODO: Add hover method for div.media-body to show truncated information in a tooltip
    }

    select(index) {
        this.$container.find("li").removeClass("active")
        this.$container.find(`li:nth-child(${index + 1})`).addClass("active")
    }

    addItemClickListener(listener){
        this.$container.find("li").on("click", e => {
            const $target = $(e.target)
            let index = -1
            if($target.prop("tagName") === "LI") index = $target.index()
            else index = $target.parents("li").index()
            listener(e, index)
        })
    }

    clear() {
        this.$container.html('')
    }
}


module.exports = ViewList
