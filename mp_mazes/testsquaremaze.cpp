/**
 * @file testsquaremaze.cpp
 * Performs basic tests of SquareMaze.
 * @date April 2007
 * @author Jonathan Ray
 */

#include <iostream>
#include "dsets.h"
#include "maze.h"
#include "cs225/PNG.h"

int main()
{
    SquareMaze m(12);
    m.makeMaze({3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3});
    std::cout << "MakeMaze complete" << std::endl;

//    cs225::PNG* unsolved = m.drawMaze();
//    unsolved->writeToFile("unsolved.png");
//    delete unsolved;
//    std::cout << "drawMaze complete" << std::endl;

    std::vector<int> sol = m.solveMaze();
    std::cout << "solveMaze complete" << std::endl;
    int count = 0;
    for (int i : sol) {
      std::cout << i << ", ";
      ++count;
      if (count % 10 == 9) {
        std::cout << std::endl;
        count = 0;
      }
    }
    std::cout << std::endl;
//    cs225::PNG* solved = m.drawMazeWithSolution();
//    solved->writeToFile("solved.png");
//    delete solved;
//    std::cout << "drawMazeWithSolution complete" << std::endl;

    return 0;
}
