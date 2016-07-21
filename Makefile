all:clean buildEnv start
start:
	node ./app.js
buildEnv:
	npm install
clean:
	rm -rf start 

