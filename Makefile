all:buildEnv start
start:
	node ./app.js
buildEnv:
	npm install

