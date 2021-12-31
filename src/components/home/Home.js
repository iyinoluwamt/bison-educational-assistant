import {Logo} from "./components/Logo";
import {Chat} from "./components/Chat";
import {News} from "./components/News";
import {Auth} from "./components/Auth";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {collection, getFirestore} from "firebase/firestore";
import {useState} from "react";

export function Home() {
    // const [vals] = useCollectionData(collection(getFirestore(), "messages"))
    const [state] = useState('a')

    return (
        <div className={"home"}>
            <Logo/>
            <Chat/>
            <News/>
            <Auth/>
        </div>
    )
}