import React,{useEffect,Fragment} from 'react'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Spinner from '../layout/Spinner'
import { DashboardActions}  from './DashboardActions'
import Experience  from './Experience'
import {getCurrentProfile , deleteAccount} from '../../actions/profile'
import Education from './Education'


const Dashboard = ({deleteAccount,getCurrentProfile,auth:{user},profile:{profile,loading}}) => {
    useEffect(()=>{
        getCurrentProfile()
    },[getCurrentProfile])
    return (
        loading && profile === null ? <Spinner/> : <Fragment>
            <h1 className="large text-primary"> Dashboard</h1>
            <p className="lead"> <i className="fas fa-user"></i>Welcome {user && user.name}</p>
            {profile? <Fragment>
               <DashboardActions/>
               <Experience experience={profile.experience}/>
               <Education education={profile.education}/>
               <div className="my-2">
                   <Link className="btn btn-danger" to="/login" onClick={()=> deleteAccount()}>
                       Delete my account
                   </Link>
               </div>
              
            </Fragment> : <Fragment><p>You have not yet setup a profile, Add some info now!</p>
            <Link to="/create-profile" className="btn btn-primary my-1">
                Create Profile
                </Link>

                </Fragment>}
        </Fragment>

        
       
    )
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    deleteAccount: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile,

})

export default connect(mapStateToProps,{getCurrentProfile,deleteAccount})(Dashboard)
