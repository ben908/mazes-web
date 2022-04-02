# mazes-web

This is an n-dimensional maze generator and solver implemented in c++ and ported using emscripten to be able to be displayed in a browser using three.js up to 3 dimensions.

The start of the maze is defined to be the corner with coordinates of all 0. (in 2d (0,0), 3d (0,0,0)) and the end of the maze is defined to be the point on the opposite side of the start that has maximum path distance to the start.

Higher than 3-dimential displaying may be implemented in the future, but the underlying c++ does work for any number of dimensions.

If any of the c++ code is changed, you can regenerate the web assembly and corresponding javascript using:
```
make all
```
If you adjust the functions described by the c++ bindings, you may need to adjust the javascript which calls the bindings.

To get a local server running you can run:
```
npm ci
npm run build
npm run serve
```