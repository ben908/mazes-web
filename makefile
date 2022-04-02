all:
	emcc -I. -o mazes.js -Oz -s ASSERTIONS=1 -s MAXIMUM_MEMORY=4294967296 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME=createModule --bind mazes_cpp_release/maze.cpp mazes_cpp_release/dsets.cpp mazes_cpp_release/binding.cpp
	rm -fr public
	mkdir -p public
	mv mazes.js public/
	mv mazes.wasm public/

clean:
	rm -fr public

