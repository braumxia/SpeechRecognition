/**
 *Date:2016-06-27
 *Author:Joe
 *Function:Guess the number the program generates randomly
**/

#include<iostream>
#include<stdlib.h>
#include<time.h>
using namespace std;

/**
 *generate a random integer number between 0 and 19.
 *input:null
 *output:randomNumber
**/

int randomNumber;
int generateRanomNumber() {
    srand((unsigned)time(NULL));
    int randomNumber = rand()%20;
    return randomNumber; 
}

/**
 *Read the number user inputs.
 *input:null
 *output:inputNumber
**/

int readUserNumber() {
    int inputNumber;
    cin >> inputNumber;
    cout << endl;  
    while(cin.fail()) {
        cout << "The number you input is invalid, please input again:";
        cin.clear();
        cin.ignore();
        cin >> inputNumber;
        cout << endl;
    }
    return inputNumber;
}

/**
 *hint user to input an integer number between 0 and 19.
 *input:null
 *output:hint string
**/

void interactWithUser() {
    cout << "Please an integer number between 0 and 19:";
}

/**
 *Compare random number the program generates with user inputs. 
 *input:randomNumber,inputNumber
 *output:0/1/2
**/

int isEqual(int randomNumber,int inputNumber) {
    if(randomNumber == inputNumber) 
	return 0;
    else if(randomNumber > inputNumber)
        return 1;
    else
        return 2;
}


/**
 *hint user to input an integer number between 0 and 19.
 *input:compare result(0/1/2).
 *output:hint string
**/
void interactWithUserAfterCompare(int flag) {
    if(flag == 0)
	cout << "Congratulate!you guess it" << endl;
    else if( flag == 1) {
	cout << "The number you input is smaller, please input again:";
        int inputNumber = readUserNumber();
        int flag0 = isEqual(randomNumber,inputNumber);
        interactWithUserAfterCompare(flag0);
    }
    else {
    cout << "The number you input is bigger, please input again:";
    int inputNumber = readUserNumber();
    int flag0 = isEqual(randomNumber,inputNumber);
    interactWithUserAfterCompare(flag0);
    }
}


/**
 *invoke function.
 *input:null
 *output:0
**/

int main() {
   randomNumber = generateRanomNumber();          //generate a random integer number between 0 and 19.
   interactWithUser();                            //hint user to input an integer number between 0 and 19.
   int inputNumber = readUserNumber();            //read the number user input.
   int flag = isEqual(randomNumber,inputNumber);  //compare random number and input number.
   interactWithUserAfterCompare(flag);            //print comparative result. 
   return 0;
}



