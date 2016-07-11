all:clean guessGame buildTestEnv guessGameTest
guessGame:guessGame.cpp
	g++ -o guessGame guessGame.cpp
guessGameTest:guessGame.cpp
	g++ -o guessGameTest guessGameTest.cpp -lunittest++
.PHONY:clean
clean:
	rm -f guessGame guessGameTest
test:
	./guessGameTest
run:
	./guessGame

buildTestEnv:
	sudo apt-get install libunittest++-dev
