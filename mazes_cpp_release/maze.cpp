#include "maze.h"

#include <cassert>
#include <map>
#include <random>

using std::pair;

bool SquareMaze::canTravel(int32_t index, int32_t dir) const {
  bool forwards = !(dir % 2);
  int32_t dim = dir / 2;
  if (forwards) {
    if (index_to_point_[index][dim] + 1 >= dimension_vector_[dim]) {
      return false;
    }
  } else {
    if (index_to_point_[index][dim] - 1 < 0) {
      return false;
    }
  }
  if (forwards) {
    if (maze_vector_[index].walls[dim]) {
      return false;
    }
  } else {
    if (maze_vector_[_next_array_position(index, dim, forwards)].walls[dim]) {
      return false;
    }
  }
  return true;
}

int SquareMaze::_mult_vec_except_first_n(const vector<int32_t>& v,
                                         int32_t leave) {
  int mul = 1;
  for (size_t i = leave; i < v.size(); ++i) {
    mul *= v[i];
  }
  return mul;
}

int SquareMaze::_next_array_position(int32_t point, int32_t dimension,
                                     bool direction) const {
  int32_t offset =
      _mult_vec_except_last_n(dimension_vector_, num_dimension_ - dimension);
  if (direction) {
    return point + offset;
  } else {
    return point - offset;
  }
}

int32_t SquareMaze::_mult_vec_except_last_n(const vector<int32_t>& v,
                                            int32_t leave) {
  int32_t mul = 1;
  for (int32_t i = 0; i < (int32_t)v.size() - leave; ++i) {
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
  index_to_point_ = vector<vector<int>>(total_num_squares,
                                        vector<int32_t>(num_dimension_, 0));
  vector<int32_t> current_vec(num_dimension_, 0);
  for (size_t i = 0; i < maze_vector_.size(); ++i) {
    index_to_point_[i] = current_vec;
    current_vec[0] += 1;
    for (int32_t j = 0; j < num_dimension_ - 1; ++j) {
      if (current_vec[j] >= dimension_vector_[j]) {
        current_vec[j + 1] += 1;
        current_vec[j] = 0;
      }
    }
  }
  current_vec[0] += 1;
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
  int32_t curr_dim_value = index_to_point_[vec_loc][dir];

  if (curr_dim_value + 1 >= dimension_vector_[dir]) return;  // check bounds
  if (_will_create_cycle(vec_loc, _next_array_position(vec_loc, dir, true)))
    return;  // check cycle

  // remove
  maze_set_.setunion(vec_loc, _next_array_position(vec_loc, dir, true));
  maze_vector_[vec_loc].walls[dir] = false;
}

bool SquareMaze::_will_create_cycle(unsigned int a, unsigned int b) {
  return maze_set_.find(a) == maze_set_.find(b);
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
  int32_t num_places_needed_to_check =
      _mult_vec_except_last_n(dimension_vector_, 1);

  int32_t max_distance = 0;
  int32_t max_dist_index = 0;

  while (!queue.empty()) {
    if (bottom_count >= num_places_needed_to_check) {
      break;
    }
    int32_t front = queue.front();

    queue.pop();
    if (have_visited[front]) continue;
    have_visited[front] = true;

    if (index_to_point_[front][num_dimension_ - 1] ==
        dimension_vector_[num_dimension_ - 1] - 1) {
      if (index_to_distance[front] + 1 > max_distance) {
        max_distance = index_to_distance[front];
        max_dist_index = front;
      }
      ++bottom_count;
    }

    int32_t front_plus_one = index_to_distance[front] + 1;
    for (int32_t i = 0; i < num_dimension_; ++i) {
      int32_t new_f = _next_array_position(front, i, true);
      if (canTravel(front, 2 * i) && !have_visited[new_f]) {
        queue.push(new_f);
        maze_vector_[new_f].previous_direction = 2 * i;
        maze_vector_[new_f].previous_point = front;
        index_to_distance[new_f] = front_plus_one;
      }

      new_f = _next_array_position(front, i, false);
      if (canTravel(front, 2 * i + 1) && !have_visited[new_f]) {
        queue.push(new_f);
        maze_vector_[new_f].previous_direction = 2 * i + 1;
        maze_vector_[new_f].previous_point = front;
        index_to_distance[new_f] = front_plus_one;
      }
    }
  }

  delete[] have_visited;

  end_location_elem = max_dist_index;

  vector<int32_t> path(max_distance);
  int32_t curr = end_location_elem;
  for (int32_t i = max_distance - 1; i >= 0; --i) {
    int32_t next = maze_vector_[curr].previous_point;
    path[i] = maze_vector_[curr].previous_direction;
    curr = next;
  }
  return path;
}