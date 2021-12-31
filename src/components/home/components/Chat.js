/**
 * The Chat component of the Home page. Contains main interface for communicating with Chatbot server.
 * @returns {JSX.Element}
 */
import {useEffect, useRef, useState} from "react";
import { serverTimestamp, getFirestore, doc, setDoc, deleteDoc, collection, query, limit, orderBy, Timestamp } from "firebase/firestore";
import {useCollectionData} from "react-firebase-hooks/firestore";
import { customAlphabet } from 'nanoid'
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {useAuthState} from "react-firebase-hooks/auth";

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)

export function Chat() {
    const auth = getAuth(), [user] = useAuthState(auth), uid = user? auth.currentUser.uid : 'none'
    const msgLog = query(collection(getFirestore(), "users", uid, "chat-log"), orderBy("timestamp"))
    const [messages] = useCollectionData(msgLog, {includeMetadataChanges: true, idField: 'id'})

    function Message({ msg }) {
        return (
            <div className={"message " + (msg.isUser? "sent" : "recv")}>{msg.text}</div>
        )
    }

    function Messages() {
        const ref = useRef()

        useEffect(() => {
            ref.current.scrollTop = ref.current.scrollHeight
        })

        return (
            <div ref={ref} className={"messages"}>
                {messages && messages.map(msg => <Message msg={msg} key={msg.id}/>)}
            </div>
        )
}

    function Input() {

        const db = getFirestore()

        const [ formValue, setFormValue ] = useState("")

        const sendMessage = (e) => {
            e.preventDefault()
            if (user && formValue !== "") {
                const data = {
                    text: formValue,
                    timestamp: Timestamp.fromDate(new Date()),
                    isUser: true,
                    uid: user.uid
                }
                setFormValue("")

                const msgDoc = doc(db, 'users', user.uid, 'chat-log', nanoid())
                // setDoc(msgDoc, data).then(() => {
                //     console.log(user.email + ": " + formValue +
                //         " \nSent: " + new Date().toTimeString() +
                //         " %c\nDocument set @ " + msgDoc.path + ".", "color: orange; font-weight: 900;")
                // }).catch((e) => {
                //     console.log(e.message)
                // })

                const successfulResponseHandler = (response) => {
                    if (!response.ok) {
                        throw new Error('HTTP error, status: ' + response.status)
                    } else {
                        console.log(response.text())
                    }
                }

                const errorResponseHandler = (error) => {
                    console.log(error)
                }

                const request = new Request('http://localhost:8080', {
                    method: 'POST',
                    body: JSON.stringify(data)
                })
                fetch(request).then(response => {successfulResponseHandler(response)}).catch(error => {errorResponseHandler(error)})
            } else {
                console.log("Not permitted to send message.")
            }
        }

        const clearMessages = async(e) => {
            setFormValue("")
            const userLog = collection(getFirestore(), "users", user.uid, "chat-log")
            for (const msg of messages) {
                const delID = msg.id
                await deleteDoc(doc(userLog, delID))
            }
        }

        const serverMessage = (e) => {
            e.preventDefault()
            const data = {
                text: "SERVER: " + new Date().toLocaleTimeString(),
                timestamp: serverTimestamp(),
                isUser: false,
                uid: 'root'
            }
            const msgDoc = doc(db, 'users', user.uid, 'chat-log', nanoid())
            setDoc(msgDoc, data).then(() => {
                    console.log("%cDocument set @ " + msgDoc.path + ".", "color: blue; font-weight: 900;")
                }).catch((e) => {
                    console.log(e.message)
                })
        }

        return (
            <form className={"chat-form"} onSubmit={sendMessage}>
                <input className={"chat-input"} value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
                <button className={"chat-submit"} type={"submit"}>SUBMIT</button>
                {/*<button className={"chat-submit"} onClick={serverMessage}>SERVER</button>*/}
                <button className={"chat-submit"} onClick={clearMessages}>CLEAR</button>
            </form>
        )
    }

    return (
        <div className={"chat"}>
            <Messages/>
            <Input/>
        </div>
    )
}
