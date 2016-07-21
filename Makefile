all:buildEnv pack
buildEnv:
	npm install
pack:
	zip -r speech.zip node_modules public routes views app.js Makefile 
