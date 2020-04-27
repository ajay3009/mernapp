import axios from 'axios';
import {setAlert} from './alerts';
import { SIGNUP_FAIL, SIGNUP_SUCCESS, AUTH_ERROR, USER_LOADED, LOGIN_FAIL, LOGIN_SUCCESS, LOGOUT } from './types';
import setAuthToken from '../utils/SetAuthToken';

// Load User
export const loadUser = () => async dispatch => {
    if (localStorage.getItem('token')) {
        setAuthToken(localStorage.getItem('token'));
    }

    try {
        const res = await axios.get('/api/auth');
        dispatch({
            type: USER_LOADED, 
            payload: res.data
        });
    } catch (error) {
        dispatch({
            type: AUTH_ERROR
        })
    }
}


//Registered User
export const register = ({name, email, password}) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({name, email, password});

    try {
        const res = await axios.post('/api/users', body, config);
        dispatch({
            type: SIGNUP_SUCCESS,
            payload: res.data
        })
        dispatch(loadUser());
    } catch (error) {
        const errors = error.response.data.errors
        if (errors) {
            errors.forEach(error => 
                dispatch(
                    setAlert(error.msg, 'danger')
                ));
        }
        dispatch({
            type: SIGNUP_FAIL
        })
    }
}

//Login User
export const login = (email, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({email, password});

    try {
        const res = await axios.post('/api/auth', body, config);
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        })

        dispatch(loadUser());
    } catch (error) {
        const errors = error.response.data.errors
        if (errors) {
            errors.forEach(error => 
                dispatch(
                    setAlert(error.msg, 'danger')
                ));
        }
        dispatch({
            type: LOGIN_FAIL
        })
    }
}

// Logout

export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    })
}