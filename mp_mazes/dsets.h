#pragma once

#include <vector>

using std::vector;

class DisjointSets {
 public:
  DisjointSets();
  explicit DisjointSets(const vector<int>& data);

  void addelements(uint32_t num);
  void setunion(uint32_t a, uint32_t b);

  int find(uint32_t elem);
  uint32_t size(uint32_t elem);

  void clear();

 private:
  vector<int> _data;
};