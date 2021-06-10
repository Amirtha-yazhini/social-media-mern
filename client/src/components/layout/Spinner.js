import React,{Fragment} from 'react'
import spinner from 'D:/social-media-mern/client/src/components/layout/spinner.gif'


export default()=>{
    return(
        <Fragment>
        <img
         src={spinner}
         style={{width:'200px',margin:'auto',display:'block'}}
         alt="Loading..."

        />
    </Fragment>
    )
  
}