#pragma once

#include <queue>
#include <vector>

#include "./cs225/PNG.h"
#include "dsets.h"

using cs225::PNG;
using std::queue;
using std::vector;

struct Square {
  Square() {}

  unsigned char previous_direction{};
  int32_t previous_point{};
  std::vector<bool> walls;
};

class SquareMaze {
 public:
  SquareMaze() : num_dimension_(2){};
  explicit SquareMaze(uint32_t dim_count) : num_dimension_(dim_count){};

  bool canTravel(int32_t x, int32_t y, int32_t dir) const;

  PNG* drawMaze() const;

  PNG* drawMazeWithSolution();

  void makeMaze(const std::vector<int32_t>& dimensions);
  void setWall(int32_t x, int32_t y, int32_t dir, bool exists);

  vector<int32_t> solveMaze();

 private:
  int32_t num_dimension_;

  DisjointSets maze_set_;
  vector<Square> maze_vector_;

  vector<int32_t> dimension_vector_;
  //  int width_{};
  //  int height_{};

  int32_t end_location_elem{};

  void _try_to_remove(int vec_loc, int dir);
  bool _will_create_cycle(uint32_t a, uint32_t b);
  unsigned int _next_array_position(const vector<uint32_t>& point,
                                    uint32_t direction);
  int _next_array_position(uint32_t point, uint32_t direction);

  static int _mult_vec_except_last_n(const vector<int32_t>& v,
                                       int32_t leave);
};