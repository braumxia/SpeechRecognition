<<<<<<< HEAD
all:buildEnv pack
buildEnv:
	npm install
pack:
	zip -r speech.zip node_modules public routes views app.js Makefile 
=======
all:clean buildEnv start
start:
	node ./app.js
buildEnv:
	npm install
clean:
	rm -rf start 

>>>>>>> 27ab2d692492ddfe42d6815fd34d1e1dfa20932e
