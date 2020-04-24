import * as actions from '../actions/types';

const initialState = [];

export default function (state = initialState, action) {
    switch (action.type) {
        case actions.SET_ALERT:
            return [
                ...state,
                action.payload
            ]
        case actions.REMOVE_ALERT:
            return state.filter(alert => alert.id !== action.payload)
        default:
            return [...state];
    }
}