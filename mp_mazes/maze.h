#pragma once

#include <queue>
#include <vector>

#include "./cs225/PNG.h"
#include "dsets.h"

using cs225::PNG;
using std::queue;
using std::vector;

struct Square {
  Square() = default;

  unsigned char previous_direction{};
  int32_t previous_point{};
  vector<bool> walls;
  bool getWallSide(int32_t w ) { return walls[w]; }
  // void setWalls(vector<bool> v) { walls = v; }
};

class SquareMaze {
 public:
  SquareMaze() : num_dimension_(2){};
  explicit SquareMaze(int32_t dim_count) : num_dimension_(dim_count){};

  bool canTravel(int32_t index, int32_t dir) const;
  bool canTravel(int32_t x, int32_t y, int32_t dir) const;

  PNG* drawMaze() const;

  PNG* drawMazeWithSolution();

  void makeMaze(const std::vector<int32_t>& dimensions);
  void setWall(int32_t x, int32_t y, int32_t dir, bool exists);

  vector<int32_t> solveMaze();
  vector<Square> getMaze() { return maze_vector_; }
  vector<int32_t> getDimensionVector() { return dimension_vector_; }
  vector<vector<int32_t>> getIndexToPointVector() { return index_to_point_; }
  
 private:
  int32_t num_dimension_;

  DisjointSets maze_set_;
  vector<Square> maze_vector_;
  vector<vector<int32_t>> index_to_point_;

  /**
   * Input as to constructor: [x, y, z, a, b, c]
   * so traversing c is near
   **/
  vector<int32_t> dimension_vector_;

  int32_t end_location_elem{};

  void _try_to_remove(int vec_loc, int dir);
  bool _will_create_cycle(uint32_t a, uint32_t b);

  /**
   *
   * @param point original index point
   * @param dim dimension index to traverse
   * @param dir true = forward, false = back
   * @return index of desired location
   */
  int _next_array_position(int32_t point, int32_t dim, bool dir) const;

  static int _mult_vec_except_last_n(const vector<int32_t>& v, int32_t leave);
  static int _mult_vec_except_first_n(const vector<int32_t>& v, int32_t leave);
};