import * as actions from './types';
import { v4 as uuidv4 } from 'uuid';

export const setAlert = (msg, alertType) => dispatch => {
    const id = uuidv4();
    dispatch({
        type: actions.SET_ALERT,
        payload: {
            msg, alertType, id
        }
    })

    setTimeout(() => {
        dispatch({
            type: actions.REMOVE_ALERT,
            payload: id
        })
    }, 5000)
}