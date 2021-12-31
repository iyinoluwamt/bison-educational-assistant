import logging
import time

import nltk
from nltk.stem.lancaster import LancasterStemmer

import numpy
import tflearn
import tensorflow as tf
import random
import json
import pickle
from os.path import exists
import os

from colors import colors

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel(logging.CRITICAL)
logging.basicConfig(level=logging.DEBUG)

MODEL = os.path.join(os.path.dirname(__file__), "..", "utils", "chatbot", "model", "model.tflearn")
PICKLE = os.path.join(os.path.dirname(__file__), "..", "utils", "chatbot", "data.pickle")
INTENTS = os.path.join(os.path.dirname(__file__), "..", "utils", "chatbot", "intents.json")
stemmer = LancasterStemmer()

with open(INTENTS) as file:
    data = json.load(file)

def query(inp):

    results = model.predict([bag_of_words(inp, words)])
    results_index = numpy.argmax(results)
    tag = labels[results_index]

    res = results[0].tolist()
    confidence = round(res[results_index] * 100, 2)
    colors.CLASSIFY_INPUT(inp, confidence, tag)
    if res[results_index] > 0.5:
        for tg in data["intents"]:
            if tg['tag'] == tag:
                responses = tg['responses']
        choice = random.choice(responses)
    else:
        choice = "Sorry, I don't know how to answer that."
    return choice

def bag_of_words(s, words):
    bag = [0 for _ in range(len(words))]

    s_words = nltk.word_tokenize(s)
    s_words = [stemmer.stem(word.lower()) for word in s_words]

    for se in s_words:
        for i, w in enumerate(words):
            if w == se:
                bag[i] = 1

    return numpy.array(bag)

if exists(PICKLE):
    with open(PICKLE, "rb") as f:
        prev_data = pickle.load(f)
        words, labels, training, output = prev_data
        logging.debug(" Pickle data loaded!")
else:
    words = []
    labels = []
    docs_x = []
    docs_y = []

    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            wrds = nltk.word_tokenize(pattern)
            words.extend(wrds)
            docs_x.append(wrds)
            docs_y.append(intent["tag"])

        if intent["tag"] not in labels:
            labels.append(intent["tag"])

    words = [stemmer.stem(w.lower()) for w in words if w != "?"]
    words = sorted(list(set(words)))

    labels = sorted(labels)

    training = []
    output = []

    out_empty = [0 for _ in range(len(labels))]

    for x, doc in enumerate(docs_x):
        bag = []

        wrds = [stemmer.stem(w.lower()) for w in doc]

        for w in words:
            if w in wrds:
                bag.append(1)
            else:
                bag.append(0)

        output_row = out_empty[:]
        output_row[labels.index(docs_y[x])] = 1

        training.append(bag)
        output.append(output_row)

    training = numpy.array(training)
    output = numpy.array(output)

    with open(PICKLE, "wb") as f:
        pickle.dump((words, labels, training, output), f)
        logging.debug(" Pickle file updated!")

tf.compat.v1.reset_default_graph()

net = tflearn.input_data(shape=[None, len(training[0])])
net = tflearn.fully_connected(net, 8)
net = tflearn.fully_connected(net, 8)
net = tflearn.fully_connected(net, len(output[0]), activation="softmax")
net = tflearn.regression(net)

model = tflearn.DNN(net)

if not exists(MODEL + ".meta"):
    time.sleep(1.5)
    model.fit(training, output, n_epoch=1000, batch_size=8, show_metric=True)
    logging.debug(" ChatBot model trained!")
    model.save(MODEL)
    logging.debug(" B.E.A. model save")
else:
    logging.debug(" B.E.A. model loaded!")
    model.load(MODEL)