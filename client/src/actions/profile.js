import axios from 'axios';
import {setAlert} from './alert'

import {
    GET_PROFILE,
    PROFILE_ERROR,
    UPDATE_PROFILE,
    ACCOUNT_DELETED,
    CLEAR_PROFILE,
    
} from './types'

//Get current users profile 
export const getCurrentProfile = ()=> async dispatch=>{
    try {
        const res = await axios.get('/api/profile/me')
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.data, status: err.response.status }
        })
        
    }
}

//Create or update a profile

export const createProfile = (formData,history, edit=false)=>async dispatch=>{
    try {
        const config ={
            headers:{
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.post('/api/profile/',formData,config)

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })

        dispatch(setAlert(edit ? 'Profile updated' :'Profile created','success'))

        if(!edit){
            history.push('/dashboard')

        }


    } catch (err) {
        
        const errors = err.response.data.errors
        if(errors){
            errors.forEach(error=> dispatch(setAlert(error.msg,'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.data.msg, status: err.response.status }
        })
        
    }

}


// Add experience
export const addExperience = (formData,history) => async dispatch=>{
    try {
        const config ={
            headers:{
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.put('/api/profile/experience',formData,config)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience added','success'))

        
            history.push('/dashboard')

        


    } catch (err) {
        
        const errors = err.response.data.errors
        if(errors){
            errors.forEach(error=> dispatch(setAlert(error.msg,'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.data.msg, status: err.response.status }
        })
        
    }


}

// Add education
export const addEducation = (formData,history) => async dispatch=>{
    try {
        const config ={
            headers:{
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.put('/api/profile/education',formData,config)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education added','success'))

        
            history.push('/dashboard')

        


    } catch (err) {
        
        const errors = err.response.data.errors
        if(errors){
            errors.forEach(error=> dispatch(setAlert(error.msg,'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.data.msg, status: err.response.status }
        })
        
    }


}

//Delete Education

export const deleteEducation = id =>async dispatch =>{
    try{
        const res = await axios.delete(`api/profile/education/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('your education field has been deleted','danger'))
    }catch(err){
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.data.msg, status: err.response.status }
        })
        

    }
}

export const deleteExperience = id =>async dispatch =>{
    try{
        const res = await axios.delete(`api/profile/experience/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('your experience field has been deleted','danger'))
    }catch(err){
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.data.msg, status: err.response.status }
        })
        

    }
}


//Delete account and profile
export const deleteAccount = id =>async dispatch =>{
    if(window.confirm("Are you sure you want to delete? This can not be undone")){
        try{
            const res = await axios.delete('api/profile')
    
            dispatch({
                type: CLEAR_PROFILE  
            })
            dispatch({type:ACCOUNT_DELETED})

    
            dispatch(setAlert('account has been deleted'))
        }catch(err){
            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.data.msg, status: err.response.status }
            })
            
    
        }

    }
   
}












