#pragma once

#include <vector>

using std::vector;

class DisjointSets {
 public:
  DisjointSets();
  explicit DisjointSets(const vector<int>& data);

  void addelements(int num);
  void setunion(int a, int b);

  int find(int elem) const;
  int size(int elem) const;

  void clear();

 private:
  vector<int> _data;
};