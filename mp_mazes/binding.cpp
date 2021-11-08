#include <emscripten/bind.h>

#include "maze.h"
#include "dsets.h"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(square_testing) {
  class_<Square>("Square")
    .constructor<>()
    .property("hasDownWall", &Square::hasDownWall)
    .property("hasRightWall", &Square::hasRightWall)
    ;
  class_<SquareMaze>("SquareMaze")
    .constructor<>()
    .function("makeMaze", &SquareMaze::makeMaze)
    .function("solveMaze", &SquareMaze::solveMaze)
    .function("getMaze", &SquareMaze::getMaze)
    ;

  register_vector<int>("vector<int>");
  register_vector<Square>("vector<Square>");
}


//compiler command:
//emcc -I. -o mazes.js -Oz -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME=createModule --bind maze.cpp dsets.cpp binding.cpp