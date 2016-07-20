all:buildEnv start
start:
    node ./voice/app.js
buildEnv:
    npm install

