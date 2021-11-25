#include <emscripten/bind.h>

#include "maze.h"
#include "dsets.h"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(square_testing) {

  class_<Square>("Square")
      .constructor<>()
      .property("walls", &Square::walls)
      .function("getWallSide", &Square::getWallSide)
      ;
  class_<SquareMaze>("SquareMaze")
      .constructor<>()
      .constructor<int32_t>()
      .function("getDimensionVector", &SquareMaze::getDimensionVector)
      .function("makeMaze", &SquareMaze::makeMaze)
      .function("getIndexToPointVector", &SquareMaze::getIndexToPointVector)
      .function("solveMaze", &SquareMaze::solveMaze)
      .function("getMaze", &SquareMaze::getMaze)
      ;
    
  register_vector<int32_t>("Int1dVec");
  register_vector<vector<int32_t>>("Int2dVec");
  register_vector<Square>("SquareVec");
}


//compiler command:
//emcc -I. -o mazes.js -Oz -s ASSERTIONS=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME=createModule --bind maze.cpp dsets.cpp binding.cpp