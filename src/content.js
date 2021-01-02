import './content.css'

import { oceanPublish } from './Ocean'
import { skynetUpload } from './Skynet'
import { streamrCollect } from './Streamr'
import { OCEAN_MARKETPLACE_URL } from './Config'

class Publish {
    constructor(clonedSidebar, formData) {
        console.log('Publish Instance initialized ...')

        this.clonedSidebar = clonedSidebar
        this.formData = formData

        window['streamr2ocean'] = new Proxy({}, {
            set: (obj, prop, value) => {
                this.statusMsg = value

                return true
            }
        })
    }

    async start() {
        const { streamId, asset, count } = this.formData

        streamrCollect(streamId, count)
            .then(json => skynetUpload(json))
            .then(file => oceanPublish(asset, file))
            .then(ddo => this.finish(ddo.id))
            .catch(error => this.errorMsg = error)
    }

    finish(ddoId) {
        window['streamr2ocean'].status = 'Successfully published'

        this.donePrevMsg()

        const clonedSidebarFooter = this.clonedSidebar.querySelector('.sidebar__footer')
        const primaryButton = clonedSidebarFooter.lastChild
        const secondaryButton = clonedSidebarFooter.firstChild

        secondaryButton.textContent = 'Close'

        primaryButton.disabled = false
        primaryButton.textContent = 'View on Ocean Market'
        primaryButton.addEventListener('click', () => window.open(OCEAN_MARKETPLACE_URL + ddoId, '_blank'))
    }

    donePrevMsg() {
        const list = this.clonedSidebar.querySelector('.sidebar__status')
        const lastItem = list.lastChild

        if (!lastItem) {
            return
        }

        lastItem.classList.add('success')
    }

    set statusMsg(msg) {
        this.donePrevMsg()

        const list = this.clonedSidebar.querySelector('.sidebar__status')
        const item = document.createElement('li')

        item.textContent = msg

        list.appendChild(item)
    }

    set errorMsg(msg) {
        const list = this.clonedSidebar.querySelector('.sidebar__status')
        const item = document.createElement('li')

        item.textContent = msg
        item.classList.add('error')

        list.appendChild(item)
    }
}


class Stream {
    constructor() {
        console.log('Stream Instance initialized ...')
    }

    get streamId() {
        const pathName = window.location.pathname
        const pathPrefix = '/core/streams'

        if (!pathName || !pathName.startsWith(pathPrefix)) {
            return
        }

        return decodeURIComponent(pathName.replace(pathPrefix, '').replace('/', ''))
    }
}

const stream = new Stream()


class UI {
    constructor() {
        this.isInjected = false
        this.isPublished = false

        console.log('UI Instance initialized ...')
    }

    render() {
        if (this.isInjected || !this.hasPermission()) {
            this.isInjected = false

            return
        }

        this.injectButton()
        this.injectSidebar()

        this.isInjected = true
    }

    hasPermission() {
        return stream.streamId && this.pageButtons
    }

    injectButton() {
        const buttons = this.pageButtons
        const button = buttons.firstChild.cloneNode()

        button.appendChild(document.createTextNode('Sell'))

        buttons.insertAdjacentElement('afterbegin', button)

        document.addEventListener('click', event => {
            const clonedSidebar = this.pageSidebars[1]

            if (!clonedSidebar) {
                return
            }

            if (event.target === button && clonedSidebar.hasAttribute('hidden')) {
                clonedSidebar.innerHTML = this.injectSidebarParts

                this.injectSidebarButtons(clonedSidebar)
                this.enableSidebarSubmitButton(clonedSidebar)

                clonedSidebar.removeAttribute('hidden')
            } else if (!event.target.closest('[class^="sidebar_"]') && !clonedSidebar.hasAttribute('hidden')) {
                clonedSidebar.setAttribute('hidden', true)

                clonedSidebar.innerHTML = ''
            }
        })
    }

    injectSidebar() {
        const pageSidebar = this.pageSidebars[0]

        if (!pageSidebar) {
            return
        }

        const clonedSidebar = pageSidebar.cloneNode()

        pageSidebar.insertAdjacentElement('afterend', clonedSidebar)
    }

    get injectSidebarParts() {
        return `
<div class="sidebar__header">
    <div>
        <h3>Sell on Ocean Market</h3>
        <div>Publish a stream snapshot on Ocean Market</div>
    </div>
</div>
<div class="sidebar__body">
    <div>
        <fieldset>
            <label for="asset-name">Title</label>
            <input type="text" required id="asset-name" placeholder="Title for your data set">
        </fieldset>

        <fieldset>
            <label for="asset-description">Description</label>
            <textarea required id="asset-description" placeholder="Details about your data set"></textarea>
        </fieldset>

        <fieldset>
            <label for="asset-author">Author</label>
            <input type="text" required id="asset-author" placeholder="Author of the data set">
        </fieldset>

        <fieldset>
            <label for="asset-license">License</label>
            <input type="text" required id="asset-license" placeholder="MIT">
        </fieldset>
    </div>

    <div>
        <fieldset>
            <label for="asset-range">Range</label>
            <input type="number" id="asset-range" required min="1" step="1" value="50" placeholder="50"> most recent stream messages
        </fieldset>
    </div>
</div>
<div class="sidebar__footer"></div>
`
    }

    injectSidebarButtons(clonedSidebar) {
        this.isPublished = false

        const clonedSidebarFooter = clonedSidebar.querySelector('.sidebar__footer')

        const submitButton = this.pageButtons.lastChild.cloneNode()

        submitButton.appendChild(document.createTextNode('Publish'))
        submitButton.disabled = true
        submitButton.addEventListener('click', async event => {
            event.preventDefault()

            if (this.isPublished) {
                return
            }

            submitButton.textContent = 'Publishing ...'
            submitButton.disabled = true

            const formData = this.formData

            this.prepareSidebarForPublish(clonedSidebar)

            this.isPublished = true

            const publish = new Publish(clonedSidebar, formData)
            await publish.start()
        })
        clonedSidebarFooter.insertAdjacentElement('afterbegin', submitButton)

        const cancelButton = document.createElement('button')

        cancelButton.type = 'button'
        cancelButton.className = 'sidebar__cancel'
        cancelButton.appendChild(document.createTextNode('Cancel'))
        cancelButton.addEventListener('click', event => {
            event.preventDefault()

            document.body.click()
        })

        clonedSidebarFooter.insertAdjacentElement('afterbegin', cancelButton)
    }

    enableSidebarSubmitButton(clonedSidebar) {
        const clonedSidebarFooter = clonedSidebar.querySelector('.sidebar__footer')
        const submitButton = clonedSidebarFooter.lastChild
        const requiredFields = Array.from(clonedSidebar.querySelectorAll('[required]'))

        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                submitButton.disabled = requiredFields.length !== requiredFields.filter(field => field.value).length
            })
        })
    }

    prepareSidebarForPublish(clonedSidebar) {
        const clonedSidebarBody = clonedSidebar.querySelector('.sidebar__body')

        clonedSidebarBody.innerHTML = `<div><ol class="sidebar__status"></ol></div>`
    }

    get formData() {
        return {
            streamId: stream.streamId,
            count: parseInt(document.getElementById('asset-range').value, 10),
            asset: {
                main: {
                    type: 'dataset',
                    name: document.getElementById('asset-name').value.toString(),
                    author: document.getElementById('asset-author').value.toString(),
                    license: document.getElementById('asset-license').value.toString(),
                },
                additionalInformation: {
                    description: document.getElementById('asset-description').value.toString(),
                }
            }
        }
    }

    get pageSidebars() {
        return document.querySelectorAll("[class^='sidebar_']")
    }

    get pageButtons() {
        const toolbar = document.querySelector("[class^='Toolbar__Right-']")

        if (!toolbar) {
            return
        }

        return toolbar.querySelector("[class^='buttons_']")
    }
}

const ui = new UI()
ui.render()


const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            ui.render()
        }
    })
})

observer.observe(document.getElementById('app'), { childList: true })
