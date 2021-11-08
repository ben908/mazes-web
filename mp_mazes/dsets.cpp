/* Your code here! */
#include "dsets.h"

#include <cassert>

void DisjointSets::addelements(int num) {
  assert(num >= 0);

  for (int i = 0; i < num; ++i) {
    _data.push_back(-1);
  }
}

int DisjointSets::find(int elem) const {
  if (_data[elem] < 0) {
    return elem;
  }
  return find(_data[elem]);
}

void DisjointSets::setunion(int a, int b) {
  a = find(a);
  b = find(b);

  int new_size = _data[a] + _data[b];
  if (_data[a] < _data[b]) {
    _data[b] = a;
    _data[a] = new_size;
    return;
  }
  _data[a] = b;
  _data[b] = new_size;
}

int DisjointSets::size(int elem) const { return -1 * _data[find(elem)]; }

DisjointSets::DisjointSets(const vector<int> &data) : _data(data) {}

void DisjointSets::clear() { _data.clear(); }

DisjointSets::DisjointSets() = default;
