function SocialAuth (){
    return(
        <div className = "flex flex-col md:flex-row gap-4">
            <button className = "p-2 border">Sign up with Google</button>
            <button className = "p-2 border">Sign up with Facebook</button>
            <button className = "p-2 border">Sign up with Apple</button>
        </div>      
    )
}


export default SocialAuth;