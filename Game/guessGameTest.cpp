#include <unittest++/UnitTest++.h>
#include "guessGame.h"

int checkRandom() {
	double randomNum = generateRanomNumber();
	if(randomNum <=19 && randomNum >=0) {   //==0则是整数
		if(randomNum - (int)randomNum == 0) {
			return 1;	
		}
	}
	else {
		return 0;	
	}
}

TEST(isEqual0) {
    CHECK(isEqual(1, 1) == 0);
}

TEST(isEqual1) {
    CHECK(isEqual(2, 1) == 1);
}

TEST(isEqual2) {
    CHECK(isEqual(1, 2) == 2);
}

TEST(generateRanomNumber) {
	
	CHECK(checkRandom() == 1);
}

int main()
{
    return UnitTest::RunAllTests();
}

