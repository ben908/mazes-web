#include "maze.h"

#include <random>
#include <cassert>
#include <map>
#include <algorithm>

using std::map;
using std::pair;

SquareMaze::SquareMaze() = default;

vector<Square> SquareMaze::getMaze() {
  return maze_vector_;
}

int main() {
  SquareMaze m;
  m.makeMaze(1500, 1500);
  m.solveMaze();
  return 1;
}

bool SquareMaze::canTravel(int x, int y, int dir) const {
  assert(dir >= 0 && dir <= 3);
  
  //check not through wall
  switch (dir) {
    case 0:
      if (x + 1 >= width_) return false;
      if (maze_vector_[width_ * y + x].hasRightWall) {
        return false;
      }
      break;
    case 1:
      if (y + 1 >= height_) return false;
      if (maze_vector_[width_ * y + x].hasDownWall) {
        return false;
      }
      break;
    case 2:
      if (x - 1 < 0) return false;
      if (maze_vector_[width_ * y + (x - 1)].hasRightWall) {
        return false;
      }
      break;
    case 3:
      if (y - 1 < 0) return false;
      if (maze_vector_[width_ * (y - 1) + x].hasDownWall) {
        return false;
      }
      break;
    default:
      throw; // should never execute
  }
  
  return true;
}

void SquareMaze::makeMaze(int width, int height) {
  maze_vector_.clear();
  maze_set_.clear();
  
  width_ = width;
  height_ = height;
  maze_vector_ = vector<Square> (width * height);
  maze_set_.addelements(width * height);
  
  vector<int> order_to_remove(2 * width * height);
  std::iota(order_to_remove.begin(), order_to_remove.end(), 0);
  
  std::random_device rd;
  std::mt19937 g(rd());
 
  std::shuffle(order_to_remove.begin(), order_to_remove.end(), g);
  
  for (int index : order_to_remove) {
    _try_to_remove(floor(index / 2), index % 2);
  }
  int stop = 1;
}

void SquareMaze::_try_to_remove(int vec_loc, int dir) {
  assert(dir == 0 || dir == 1);
  int x = vec_loc % width_;
  int y = vec_loc / width_;
  
  switch (dir) {
    case 0:
      if (x + 1 >= width_) return;//check bounds
      if (_will_create_cycle(vec_loc, vec_loc + 1)) return;//check cycle
      
      //remove
      maze_set_.setunion(vec_loc, vec_loc + 1);
      maze_vector_[vec_loc].hasRightWall = false;
      break;
      
    case 1:
      if (y + 1 >= height_) return; //check bounds
      if (_will_create_cycle(vec_loc, vec_loc + width_)) return; //check cycle
      
      //remove
      maze_set_.setunion(vec_loc, vec_loc + width_);
      maze_vector_[vec_loc].hasDownWall = false;
      break;
      
    default:
      throw; // should never execute
  }
}

bool SquareMaze::_will_create_cycle(int a, int b) {
  return maze_set_.find(a) == maze_set_.find(b);
}

void SquareMaze::setWall(int x, int y, int dir, bool exists) {
  assert(dir >= 0 && dir <= 1);
  assert(x < width_ && x >= 0);
  assert(y < height_ && y >= 0);
  
  switch (dir) {
    case 0:
      maze_vector_[width_ * y + x].hasRightWall = exists;
      break;
    case 1:
      maze_vector_[width_ * y + x].hasDownWall = exists;
      break;
    default:
      throw; // should never execute
  }
}

vector<int> SquareMaze::solveMaze() {
  vector<int> curr_best(0);
  int farthest_x = _get_farthest_on_bottom();
  end_location_elem = (height_ - 1) * (width_) + farthest_x;
  vector<int> res;
  _path_between_points(0, end_location_elem, res);
  
  return res;
}

int SquareMaze::_get_farthest_on_bottom() {
  queue<int> queue;
  queue.push(0);
  bool* have_visited = new bool[width_ * height_];
  for (int i = 0; i < width_ * height_; ++i) {
    have_visited[i] = false;
  }
  vector<int> bottom_distances (width_);
  
  map<int, int> map;
  int bottom_count = 0;
  
  while (!queue.empty()) {
    if (bottom_count >= width_) {
      break;
    }
    int front = queue.front();
    int x = front % width_;
    int y = front / width_;
    queue.pop();
    if (have_visited[front]) continue;
    
    have_visited[front] = true;
    
    if (y == height_ - 1) {
      bottom_distances[x] = map[front] + 1;
      ++bottom_count;
    }
    
    if (canTravel(x, y, 0) && !have_visited[front + 1]) {
      queue.push(y * width_ + x + 1);
      map.insert(pair<int, int>(front + 1, map[front] + 1));
    }
    if (canTravel(x, y, 1) && !have_visited[front + width_]) {
      queue.push(y * width_ + x + width_);
      map.insert(pair<int, int>(front + width_, map[front] + 1));
    }
    if (canTravel(x, y, 2) && !have_visited[front - 1]) {
      queue.push(y * width_ + x - 1);
      map.insert(pair<int, int>(front - 1, map[front] + 1));
    }
    if (canTravel(x, y, 3) && !have_visited[front - width_]) {
      queue.push(y * width_ + x - width_);
      map.insert(pair<int, int>(front - width_, map[front] + 1));
    }
  }
  delete[] have_visited;
  //go through vector
  return (int) std::distance(bottom_distances.begin(),
                       std::max_element(bottom_distances.begin(),
                                        bottom_distances.end()));
}

bool SquareMaze::_any_zeros(const vector<int>& vec) {
  if (std::count(vec.begin(), vec.end(), 0)) {
    return true;
  }
  return false;
}

void SquareMaze::_path_between_points(int a, int b, vector<int>& path) {
  queue<int> start_queue;
  start_queue.push(a);

  _bfs_rec(a, b, path, start_queue);
}

void SquareMaze::_bfs_rec(int a, int b, vector<int>& path, queue<int>& queue) {
  bool* have_visited = new bool[width_ * height_];
  for (int i = 0; i < width_ * height_; ++i) {
    have_visited[i] = false;
  }
  
  map<int, int> map;
      
  while (!queue.empty()) {
    int front = queue.front();
    int x = front % width_;
    int y = front / width_;
    queue.pop();
    if (have_visited[front]) continue;
    if (front == b) {
      break;
    }
    
    have_visited[front] = true;
    
    if (canTravel(x, y, 0) && !have_visited[front + 1]) {
      queue.push(y * width_ + x + 1);
      map.insert(pair<int, int>(front + 1, front));
    }
    if (canTravel(x, y, 1) && !have_visited[front + width_]) {
      queue.push(y * width_ + x + width_);
      map.insert(pair<int, int>(front + width_, front));
    }
    if (canTravel(x, y, 2) && !have_visited[front - 1]) {
      queue.push(y * width_ + x - 1);
      map.insert(pair<int, int>(front - 1, front));
    }
    if (canTravel(x, y, 3) && !have_visited[front - width_]) {
      queue.push(y * width_ + x - width_);
      map.insert(pair<int, int>(front - width_, front));
    }
  }
  int curr = b;
  while (curr != a) {
    int next = map[curr];
    path.insert(path.begin(), _dir_from_points(curr, next));
    curr = next;
  }
  delete[] have_visited;
}

int SquareMaze::_dir_from_points(int start, int end) const {
  int diff = start - end;
  if (diff == 1) return 0;
  if (diff == width_) return 1;
  if (diff == -1) return 2;
  if (diff == -1 * width_) return 3;
  assert(false); // should never execute
}
