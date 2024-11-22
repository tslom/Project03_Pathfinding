import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging class names.
 * Combines Tailwind classes with conflict resolution using `clsx` and `tailwind-merge`.
 * @param inputs - Class values to merge.
 * @returns A single merged class name string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Represents a node in the grid with coordinates and pathfinding costs.
 */
export type Node = Coord & {
  gCost: number; // Cost from the start node to this node
  hCost: number; // Heuristic cost (estimated cost to the end node)
  parent?: Node; // Reference to the parent node for reconstructing the path
};

/**
 * Represents a coordinate on the grid.
 */
export type Coord = {
  x: number; // X-coordinate
  y: number; // Y-coordinate
};

/**
 * Generates a maze using Prim's algorithm.
 * The maze is represented as a grid, where `true` indicates a passage and `false` indicates a wall.
 * @param width - Width of the grid.
 * @param height - Height of the grid.
 * @returns An object containing:
 *  - `finalWallList`: A list of coordinates representing walls.
 *  - `start`: Starting coordinate of the maze.
 *  - `end`: Ending coordinate of the maze.
 */
export function mazePrimsAlgorithm(width: number, height: number) {
  // Initialize the grid with all walls (`false`)
  const grid = Array.from({ length: width }, () => Array(height).fill(false));

  // Randomly select the initial cell and mark it as a passage
  const firstCell = {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height)
  };
  grid[firstCell.x][firstCell.y] = true;

  /**
   * Retrieves the four neighboring cells of a given coordinate.
   * Ensures that neighbors are within grid boundaries.
   * @param coord - The coordinate to find neighbors for.
   * @returns A list of neighboring coordinates.
   */
  const getCells = (coord: Coord): Coord[] => {
    const directions: Coord[] = [
      { x: -1, y: 0 }, // Left
      { x: 0, y: 1 },  // Down
      { x: 1, y: 0 },  // Right
      { x: 0, y: -1 }  // Up
    ];

    return directions
        .map(direction => ({
          x: direction.x + coord.x,
          y: direction.y + coord.y
        }))
        .filter(coord => coord.x >= 0 && coord.y >= 0 && coord.x < width && coord.y < height);
  };

  // Initialize the wall list with neighbors of the first cell
  let wallList = getCells(firstCell);

  // Generate the maze
  while (wallList.length > 0) {
    // Randomly pick a wall from the list
    const randomWallIndex = Math.floor(Math.random() * wallList.length);
    const randomWall = wallList[randomWallIndex];

    // Count the number of passages surrounding the wall
    let count = 0;
    const wallSurroundings = getCells(randomWall);
    for (let cell of wallSurroundings) {
      if (grid[cell.x][cell.y]) {
        count++;
      }
    }

    // If exactly one surrounding tile is a passage, convert the wall into a passage
    if (count === 1) {
      grid[randomWall.x][randomWall.y] = true;
      // Add neighboring walls to the wall list
      wallList = [
        ...wallList,
        ...wallSurroundings.filter(cell => !grid[cell.x][cell.y])
      ];
    }

    // Remove the wall from the wall list
    wallList.splice(randomWallIndex, 1);
  }

  // Extract all wall coordinates into a list
  const finalWallList: Coord[] = [];
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      if (!grid[x][y]) {
        finalWallList.push({ x, y });
      }
    }
  }

  // Determine the start and end points
  let start: Coord = { x: 0, y: 0 };
  let end: Coord = { x: 0, y: 0 };

  let startFound = false;
  let endFound = false;

  for (let i = 0; i < grid.length; i++) {
    if (!(startFound && endFound)) {
      // Find the first passage in the first row for the start point
      if (grid[0][i] && !startFound) {
        start = { x: 0, y: i };
        startFound = true;
      }
      // Find the first passage in the last row for the end point
      if (grid[grid.length - 1 - i][height - 1] && !endFound) {
        end = { x: grid.length - 1 - i, y: height - 1 };
        endFound = true;
      }
    } else {
      break;
    }
  }

  // Return the wall list and start/end points
  return { finalWallList, start, end };
}