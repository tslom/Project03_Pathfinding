# A* Pathfinding Visualizer

This project implements a visual representation of the A* Pathfinding algorithm using React and TypeScript. It allows users to customize the grid, set start and end nodes, add walls, and visualize the shortest path calculated by the algorithm.

---

## Features

- **Customizable Grid:** Adjust the grid dimensions and tile states.
- **Start/End Nodes:** Click to set the start and end positions for the pathfinding.
- **Walls:** Add or remove wall tiles to block the path.
- **Diagonal Movement:** Toggle diagonal movement in the algorithm.
- **Heuristic Choices:** Switch between Manhattan and Diagonal distance for heuristic calculation.
- **Random Maze Generation:** Generate random mazes using Prim's algorithm.

---

## Heuristic Choices

The algorithm supports two heuristics to estimate the shortest path:

### Manhattan Distance

- **Used when diagonal movement is disabled.**
- **Formula:** `D * (dx + dy)`
    - `D` is the cost of moving in a straight line.
    - `dx` and `dy` are the horizontal and vertical distances, respectively.
- Suitable for grids where movement is restricted to straight lines (up, down, left, right).

### Diagonal Distance

- **Used when diagonal movement is enabled.**
- **Formula:** `D * (dx + dy) + (D2 - 2 * D) * min(dx, dy)`
    - `D` is the cost of straight-line movement.
    - `D2` is the cost of diagonal movement (usually greater than `D`).
    - `dx` and `dy` are the horizontal and vertical distances, respectively.
    - `min(dx, dy)` ensures diagonal movement is factored properly.
- Suitable for grids where diagonal movement is allowed, providing a more realistic path.

Here:
- `D` is the cost of moving in a straight line.
- `D2` is the cost of moving diagonally (typically slightly higher than `D`).

---

## Algorithm Implementation

The A* algorithm finds the shortest path by:
1. Initializing the open set with the start node.
2. Iteratively selecting the node with the smallest `fCost` (where `fCost = gCost + hCost`).
3. Evaluating neighboring nodes:
    - Adding valid neighbors to the open set.
    - Updating costs (`gCost` and `hCost`) and parent nodes as needed.
4. Terminating when the end node is reached or the open set is empty.
5. Backtracking from the end node to reconstruct the path.

Key methods in the implementation:
- **`getValidNeighbors`:** Filters neighbors based on grid boundaries, wall presence, and closed nodes.
- **`getManhattanDistance` and `getDiagonalDistance`:** Calculate heuristic values for the respective movement modes.
- **`startPathFind`:** Main function that drives the A* algorithm, updates state for rendering, and visualizes the process.

---

## Testing the Code

To test the A* Pathfinding Visualizer, follow these steps:

### Prerequisites
- Ensure you have **Node.js** installed.
- Install dependencies using `npm install`.

### Run the Application
1. Start the development server with:
   ```bash
   npm run dev
   ```

2. Visit (http://localhost:3000/) to view and test out the project. 
