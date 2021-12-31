import http.server
import logging, json, os
import socketserver
import threading
import time
from chatbot import query
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.oauth2 import service_account

# from chatbot import query
from colors import colors

PORT = 8080

ADMIN_SDK = 'howard-bea-firebase-adminsdk-5sr5u-021e1586d2.json'
ADMIN_CREDENTIALS = os.path.join(os.path.dirname(__file__), '..', 'utils', 'static', ADMIN_SDK)
FIREBASE_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'utils', 'static', 'firebase-config.json')
PUBLIC_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', '..', 'public')

logging.basicConfig(level=logging.DEBUG)
FIREBASE_CONFIG = json.load(open(FIREBASE_CONFIG_PATH), )

callback_doneA = threading.Event()
callback_doneB = threading.Event()

# Use the application default credentials
cred = credentials.Certificate(ADMIN_CREDENTIALS)
firebase_admin.initialize_app(cred, {
    'projectId': FIREBASE_CONFIG["projectId"],
})
db = firestore.client()
messageDB_ref = db.collection(u'users')


def classify_input(inpt, confidence, tag):
    print(f"{colors.fg.green}{colors.bold}{inpt} ({confidence}% - {tag}){colors.reset}")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIRECTORY, **kwargs)

    def do_POST(self):
        self.send_response(200)
        content_length = int(self.headers['Content-Length'])
        post_body = self.rfile.read(content_length).decode()
        self.end_headers()

        doc = json.loads(post_body)
        doc['timestamp'] = firestore.firestore.SERVER_TIMESTAMP

        response = {
            'text': query(doc['text']),
            'timestamp': firestore.firestore.SERVER_TIMESTAMP,
            'uid': u'root',
            'isUser': False
        }

        messageDB_ref.document(doc['uid']).collection('chat-log').document().set(doc)
        time.sleep(0.25)
        messageDB_ref.document(doc['uid']).collection('chat-log').document().set(response)
