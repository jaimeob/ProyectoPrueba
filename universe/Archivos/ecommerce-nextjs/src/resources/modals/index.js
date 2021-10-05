import React, { useState } from "react"
import ReactDOM from "react-dom"

import { Provider } from 'react-redux'

import { store } from "../../store"

function renderModal(Children, props) {

    /* Create div to show the modal */
    const div = document.createElement('div')
    document.body.appendChild(div)

    const exit = () => {
        const unmountResult = ReactDOM.unmountComponentAtNode(div)
        if (props && props.onClose) props.onClose()
    }
    ReactDOM.render(<Provider store={store}>
        <Children exit={exit} {...props} />
    </Provider>, div)
}

export {
    renderModal
}