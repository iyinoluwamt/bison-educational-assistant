import { getAuth, onAuthStateChanged,GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import {useEffect, useRef, useState} from "react";

function Login() {
    const provider = new GoogleAuthProvider()
    const auth = getAuth()

    const signInHandler = (result) => {
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // // The signed-in user info.
        // const user = result.user;
        console.log(result.user.email + " signed in.")
    }

    const errorHandler = (error) => {
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        console.log(email + ": " + errorMessage)
        // // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
    }

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then(
            result => signInHandler(result)).catch(
                error => errorHandler(error))
    }

    return (
        <button className={"login"} onClick={signInWithGoogle}>Login</button>
    )
}

function Register() {
    return (
        <button className={"register"}>Register</button>
    )
}

function SignOut() {

    function logoutHandler() {
        const auth = getAuth()
        signOut(auth).then(() => {
            console.log("User signed out.")
        }).catch((error) => {
            console.log("Sign out error. -> " + error)
        })
    }

    return (
        <button className={"sign-out"} onClick={logoutHandler}>Sign Out</button>
    )
}

function Profile({ user }) {
    const auth = getAuth()
    const defaultPhoto = require("../../../assets/user.png")

    const [url, setURL] = useState(null)

    onAuthStateChanged(auth, user => {
        if (user) {
            setURL(user.photoURL)
        } else {
            setURL(defaultPhoto)
        }
    })

    return (
        <div className={"profile center"}>
            <img className={"profile-pic"} src={url? url : defaultPhoto} alt={"Default Profile"}/>
        </div>
    )
}

/**
 * The Auth component of the Home page. Contains buttons to alter auth status (login/logout).
 * @returns {JSX.Element}
 */
export function Auth() {
    const auth = getAuth()
    const [user, setUser] = useState(null)

    onAuthStateChanged(auth, user => {
        setUser(user)
    })

    return (
        <div className={"auth"}>
            {/*The Auth component.*/}
            <div className={"column center"}>
                <Profile user={user}/>
                <div>{user?
                    "Hi, " + user.displayName + "!" : "Not signed in."}
                </div>
            </div>
            {user? <div className={"column center"}><SignOut/></div> : <div className={"column center"}><Login/><Register/></div>}
        </div>
    )
}