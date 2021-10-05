import { NEWSLETTER_SUBSCRIBER } from '../actions/actionNewsletterModal'

export default function newsletter(state={}, action) {

    const type = action.type

    switch (type) {
        case NEWSLETTER_SUBSCRIBER: {
            return Object.assign({}, state, {status: action.status})
        }
    
        default:
            return state
    }
    
}

