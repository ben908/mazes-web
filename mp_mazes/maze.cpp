#include "maze.h"

#include <cassert>
#include <map>
#include <random>

using cs225::HSLAPixel;
using std::pair;

bool SquareMaze::canTravel(int32_t x, int32_t y, int32_t dir) const {
  //  assert(dir >= 0 && dir <= 3);

  // check not through wall
  switch (dir) {
    case 0:
      if (x + 1 >= dimension_vector_[0]) return false;
      if (maze_vector_[dimension_vector_[0] * y + x].walls[0]) {
        return false;
      }
      break;
    case 2:
      if (y + 1 >= dimension_vector_[1]) return false;
      if (maze_vector_[dimension_vector_[0] * y + x].walls[1]) {
        return false;
      }
      break;
    case 1:
      if (x - 1 < 0) return false;
      if (maze_vector_[dimension_vector_[0] * y + (x - 1)].walls[0]) {
        return false;
      }
      break;
    case 3:
      if (y - 1 < 0) return false;
      if (maze_vector_[dimension_vector_[0] * (y - 1) + x].walls[1]) {
        return false;
      }
      break;
    default:
      throw;  // should never execute
  }

  return true;
}

unsigned int SquareMaze::_next_array_position(const vector<uint32_t>& point,
                                              uint32_t direction) {
  std::vector<unsigned int> point_vec(0);

  //  xn = ( ( Index - Index( x1, ..., x{n-1} ) ) / Product( D1, ..., D{N-1} ) )
  //  % Dn

  return 0;
}

int SquareMaze::_next_array_position(uint32_t point, uint32_t direction) {
  return 0;
}

int32_t SquareMaze::_mult_vec_except_last_n(const vector<int32_t>& v,
                                            int32_t leave) {
  unsigned int mul = 1;
  for (size_t i = 0; i < v.size() - leave; ++i) {
    mul *= v[i];
  }
  return mul;
}

void SquareMaze::makeMaze(const std::vector<int32_t>& dimensions) {
  assert(num_dimension_ == (int)dimensions.size());

  maze_vector_.clear();
  maze_set_.clear();

  dimension_vector_ = dimensions;

  int32_t total_num_squares = _mult_vec_except_last_n(dimensions, 0);
  maze_vector_ = vector<Square>(total_num_squares);
  for (int32_t i = 0; i < total_num_squares; ++i) {
    maze_vector_[i].walls = std::vector<bool>(num_dimension_);
    for (int j = 0; j < num_dimension_; ++j) {
      maze_vector_[i].walls[j] = true;
    }
  }
  maze_set_.addelements(total_num_squares);

  vector<int> order_to_remove(num_dimension_ * total_num_squares);
  std::iota(order_to_remove.begin(), order_to_remove.end(), 0);

  std::random_device rd;
  std::mt19937 g(rd());

  std::shuffle(order_to_remove.begin(), order_to_remove.end(), g);

  for (int index : order_to_remove) {
    _try_to_remove(index / num_dimension_, index % num_dimension_);
    if ((int)maze_set_.size(0) == total_num_squares) break;
  }
}

void SquareMaze::_try_to_remove(int vec_loc, int dir) {
  //  assert(dir == 0 || dir == 1);
  int32_t x = vec_loc % dimension_vector_[0];
  int32_t y = vec_loc / dimension_vector_[0];

  switch (dir) {
    case 0:
      if (x + 1 >= dimension_vector_[0]) return;             // check bounds
      if (_will_create_cycle(vec_loc, vec_loc + 1)) return;  // check cycle

      // remove
      maze_set_.setunion(vec_loc, vec_loc + 1);
      maze_vector_[vec_loc].walls[0] = false;
      break;

    case 1:
      if (y + 1 >= dimension_vector_[1]) return;  // check bounds
      if (_will_create_cycle(vec_loc, vec_loc + dimension_vector_[0]))
        return;  // check cycle

      // remove
      maze_set_.setunion(vec_loc, vec_loc + dimension_vector_[0]);
      maze_vector_[vec_loc].walls[1] = false;
      break;

    default:
      throw;  // should never execute
  }
}

bool SquareMaze::_will_create_cycle(unsigned int a, unsigned int b) {
  return maze_set_.find(a) == maze_set_.find(b);
}

void SquareMaze::setWall(int32_t x, int32_t y, int32_t dir, bool exists) {
  assert(dir >= 0 && dir <= 1);
  assert(x < dimension_vector_[0] && x >= 0);
  assert(y < dimension_vector_[1] && y >= 0);

  switch (dir) {
    case 0:
      maze_vector_[dimension_vector_[0] * y + x].walls[0] = exists;
      break;
    case 1:
      maze_vector_[dimension_vector_[0] * y + x].walls[1] = exists;
      break;
    default:
      throw;  // should never execute
  }
}

vector<int32_t> SquareMaze::solveMaze() {
  queue<int32_t> queue;
  queue.push(0);

  int32_t total_num_squares = _mult_vec_except_last_n(dimension_vector_, 0);
  bool* have_visited = new bool[total_num_squares];
  for (int32_t i = 0; i < total_num_squares; ++i) {
    have_visited[i] = false;
  }

  vector<int32_t> index_to_distance(total_num_squares);
  int32_t bottom_count = 0;

  int32_t max_distance = 0;
  int32_t max_dist_x = 0;

  while (!queue.empty()) {
    if (bottom_count >= dimension_vector_[0]) {
      break;
    }
    int32_t front = queue.front();
    int32_t x = front % dimension_vector_[0];
    int32_t y = front / dimension_vector_[0];
    queue.pop();
    if (have_visited[front]) continue;

    have_visited[front] = true;

    if (y == dimension_vector_[1] - 1) {
      if (index_to_distance[front] + 1 > max_distance) {
        max_distance = index_to_distance[front];
        max_dist_x = x;
      }
      ++bottom_count;
    }

    int32_t new_f = front + 1;
    int32_t front_plus_one = index_to_distance[front] + 1;
    if (canTravel(x, y, 0) && !have_visited[new_f]) {
      queue.push(new_f);
      maze_vector_[new_f].previous_direction = 0;
      maze_vector_[new_f].previous_point = front;
      index_to_distance[new_f] = front_plus_one;
    }
    new_f = front + dimension_vector_[0];
    if (canTravel(x, y, 2) && !have_visited[new_f]) {
      queue.push(new_f);
      maze_vector_[new_f].previous_direction = 2;
      maze_vector_[new_f].previous_point = front;
      index_to_distance[new_f] = front_plus_one;
    }
    new_f = front - 1;
    if (canTravel(x, y, 1) && !have_visited[new_f]) {
      queue.push(new_f);
      maze_vector_[new_f].previous_direction = 1;
      maze_vector_[new_f].previous_point = front;
      index_to_distance[new_f] = front_plus_one;
    }
    new_f = front - dimension_vector_[0];
    if (canTravel(x, y, 3) && !have_visited[new_f]) {
      queue.push(new_f);
      maze_vector_[new_f].previous_direction = 3;
      maze_vector_[new_f].previous_point = front;
      index_to_distance[new_f] = front_plus_one;
    }
  }

  delete[] have_visited;

  end_location_elem =
      (dimension_vector_[1] - 1) * (dimension_vector_[0]) + max_dist_x;

  vector<int32_t> path(max_distance);
  int32_t curr = end_location_elem;
  for (int32_t i = max_distance - 1; i >= 0; --i) {
    int32_t next = maze_vector_[curr].previous_point;
    path[i] = maze_vector_[curr].previous_direction;
    curr = next;
  }
  return path;
}

PNG* SquareMaze::drawMaze() const {
  PNG* to_return =
      new PNG(dimension_vector_[0] * 10 + 1, dimension_vector_[1] * 10 + 1);
  // blacken far left column
  for (int i = 0; i < (int)to_return->height(); ++i) {
    HSLAPixel& pix = to_return->getPixel(0, i);
    pix.h = 0;
    pix.s = 0;
    pix.l = 0;
  }
  for (int i = 0; i < (int)to_return->width(); ++i) {
    if (i >= 1 && i <= 9) continue;
    HSLAPixel& pix = to_return->getPixel(i, 0);
    pix.h = 0;
    pix.s = 0;
    pix.l = 0;
  }
  for (uint32_t i = 0; i < maze_vector_.size(); ++i) {
    const Square& s = maze_vector_[i];
    uint32_t x = i % dimension_vector_[0];
    uint32_t y = i / dimension_vector_[0];
    if (s.walls[0]) {
      for (size_t k = 0; k <= 10; ++k) {
        HSLAPixel& pix = to_return->getPixel((x + 1) * 10, (y * 10) + k);
        pix.h = 0;
        pix.s = 0;
        pix.l = 0;
      }
    }
    if (s.walls[1]) {
      for (size_t k = 0; k <= 10; ++k) {
        HSLAPixel& pix = to_return->getPixel((x * 10) + k, (y + 1) * 10);
        pix.h = 0;
        pix.s = 0;
        pix.l = 0;
      }
    }
  }

  return to_return;
}

PNG* SquareMaze::drawMazeWithSolution() {
  PNG* maze = drawMaze();
  int curr_x = 5;
  int curr_y = 5;
  HSLAPixel& start = maze->getPixel(curr_x, curr_y);
  start = HSLAPixel(0, 1, 0.5, 1);
  const vector<int32_t>& solution = solveMaze();
  for (uint32_t direction : solution) {
    switch (direction) {
      case 0:
        for (int i = 0; i < 10; ++i) {
          ++curr_x;
          HSLAPixel& pix = maze->getPixel(curr_x, curr_y);
          pix.h = 0;
          pix.s = 1;
          pix.l = 0.5;
          pix.a = 1;
        }
        break;
      case 2:
        for (int i = 0; i < 10; ++i) {
          ++curr_y;
          HSLAPixel& pix = maze->getPixel(curr_x, curr_y);
          pix.h = 0;
          pix.s = 1;
          pix.l = 0.5;
          pix.a = 1;
        }
        break;
      case 1:
        for (int i = 0; i < 10; ++i) {
          --curr_x;
          HSLAPixel& pix = maze->getPixel(curr_x, curr_y);
          pix.h = 0;
          pix.s = 1;
          pix.l = 0.5;
          pix.a = 1;
        }
        break;
      case 3:
        for (int i = 0; i < 10; ++i) {
          --curr_y;
          HSLAPixel& pix = maze->getPixel(curr_x, curr_y);
          pix.h = 0;
          pix.s = 1;
          pix.l = 0.5;
          pix.a = 1;
        }
        break;
      default:
        throw;  // should never execute
    }
  }
  maze_vector_[end_location_elem].walls[num_dimension_] = false;
  uint32_t x = end_location_elem % dimension_vector_[0];
  uint32_t y = end_location_elem / dimension_vector_[0];

  HSLAPixel white = HSLAPixel(0, 0, 1, 1);
  for (int k = 1; k <= 9; ++k) {
    HSLAPixel& pix = maze->getPixel(x * 10 + k, (y + 1) * 10);
    pix = white;
  }
  num_dimension_++;
  return maze;
}
