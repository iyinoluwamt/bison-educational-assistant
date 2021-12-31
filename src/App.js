import './public/App.css';
import  './public/home.css'

import {Home} from "./components/home/Home";
import { initializeApp } from "firebase/app"

const config = require("./utils/static/firebase-config.json")
const app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
})

function App() {
    return (
        <div className="App">
          <Home/>
        </div>
    );
}

export default App;
