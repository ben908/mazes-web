#pragma once

#include <queue>
#include <vector>

#include "dsets.h"

using std::vector;
using std::queue;

struct Square {
  Square() : hasDownWall(true), hasRightWall(true) {}
  bool hasDownWall;
  bool hasRightWall;
};

class SquareMaze {
 public:

  SquareMaze();

  bool canTravel(int x, int y, int dir) const;
  void makeMaze(int width, int height);
  void setWall(int x, int y, int dir, bool exists);
  
  vector<int> solveMaze();
  vector<Square> getMaze();

 private:
  DisjointSets maze_set_;
  vector<Square> maze_vector_;
  int width_{};
  int height_{};
  
  int end_location_elem;

  void _try_to_remove(int vec_loc, int dir);
  bool _will_create_cycle(int a, int b);
  void _path_between_points(int vec_loc_a, int vec_loc_b, vector<int>& path);
  void _bfs_rec(int a, int b, vector<int>& path, queue<int>& queue);
  int _dir_from_points(int start, int end) const;
  int _get_farthest_on_bottom();
  bool _any_zeros(const vector<int>& vec);
};