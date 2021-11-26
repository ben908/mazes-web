/* Your code here! */
#include "dsets.h"

#include <cassert>

void DisjointSets::addelements(uint32_t num) {
  assert(num >= 0);

  _data.insert(_data.end(), num, -1);
}

uint32_t DisjointSets::find(uint32_t elem) {
  if (_data[elem] < 0) {
    return elem;
  }
  _data[elem] = static_cast<int32_t>(find(_data[elem]));
  return _data[elem];
}

void DisjointSets::setunion(uint32_t a, uint32_t b) {
  a = find(a);
  b = find(b);

  int new_size = _data[a] + _data[b];
  if (_data[a] < _data[b]) {
    _data[b] = static_cast<int32_t>(a);
    _data[a] = new_size;
    return;
  }
  _data[a] = static_cast<int32_t>(b);
  _data[b] = new_size;
}

uint32_t DisjointSets::size(uint32_t elem) { return -1 * _data[find(elem)]; }

DisjointSets::DisjointSets(const vector<int>& data) : _data(data) {}

void DisjointSets::clear() { _data.clear(); }

DisjointSets::DisjointSets() = default;
