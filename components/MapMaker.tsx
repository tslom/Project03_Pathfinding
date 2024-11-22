"use client"

import React, { useEffect, useState} from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider";

import {Node, Coord, mazePrimsAlgorithm} from "@/lib/utils";

const MapMaker = () => {
    const D = 10
    const D2 = Math.round(Math.sqrt(D ** 2 + D ** 2))
    const WIDTH = 125;
    const HEIGHT = 50;

    const [width, setWidth] = useState(WIDTH);
    const [height, setHeight] = useState(HEIGHT);
    const [currentNode, setCurrentNode] = useState<"start"|"end"|"wall">("start");
    const [start, setStart] = useState<Coord>({x: 0, y: 0});
    const [end, setEnd] = useState<Coord>({x: 1, y: 1});
    const [walls, setWalls] = useState<Coord[]>([]);
    const [openNodes, setOpenNodes] = useState<Node[]>([]);
    const [closedNodes, setClosedNodes] = useState<Node[]>([]);
    const [nodePath, setNodePath] = useState<Coord[]>([]);
    const [mouseDown, setMouseDown] = useState(false);
    const [toggleTile, setToggleTile] = useState(false);
    const [instant, setInstant] = useState(true);
    const [speed, setSpeed] = useState(50);
    const [diagonalMovement, setDiagonalMovement] = useState(true);
    const [iterations, setIterations] = useState(0);
    const [distance, setDistance] = useState(0);


    const colorClasses = {
        green: "bg-green-500 text-white hover:bg-green-600",
        red: "bg-red-500 text-white hover:bg-red-600",
        orange: "bg-orange-500 text-white hover:bg-orange-600",
        grey: "bg-gray-500 text-white hover:bg-gray-600",
        blue: "bg-blue-500 text-white hover:bg-blue-600",
        default: "bg-purple-500 hover:bg-purple-600 text-white", // default fallback
    };

    /**
     * Resets the pathfinding state by clearing open nodes, closed nodes, and the calculated path.
     */
    const reset = () => {
        setOpenNodes([]);
        setClosedNodes([]);
        setNodePath([]);
    };

    /**
     * Resets the wall state by clearing all walls from the grid.
     */
    const resetWalls = () => {
        setWalls([]);
    };

    /**
     * Generates a random maze using Prim's algorithm.
     * Resets the grid, waits briefly for reactivity, and then sets the maze data.
     */
    const generateMaze = async () => {
        reset(); // Clear all states before generating a new maze
        await new Promise(resolve => setTimeout(resolve, 1)); // Allow React state to update
        const { finalWallList, start, end } = mazePrimsAlgorithm(width, height);
        await new Promise(resolve => setTimeout(resolve, 1)); // Ensure React re-renders
        setWalls(finalWallList);
        setStart(start);
        setEnd(end);
    };

    /**
     * Handles changes to the grid width input and ensures the value is within bounds.
     * @param e - The input change event containing the new width value.
     */
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(5, Math.min(WIDTH, Number(e.target.value)));
        setWidth(value);
    };

    /**
     * Handles changes to the grid height input and ensures the value is within bounds.
     * @param e - The input change event containing the new height value.
     */
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(5, Math.min(HEIGHT, Number(e.target.value)));
        setHeight(value);
    };

    /**
     * Handles tile clicks to set the start, end, or toggle walls based on the current node type.
     * @param row - The row index of the clicked tile.
     * @param col - The column index of the clicked tile.
     */
    const handleNodeClick = (row: number, col: number) => {
        const position = { x: row, y: col };

        if (currentNode === 'start') {
            setStart(position); // Set the start node
        } else if (currentNode === 'end') {
            setEnd(position); // Set the end node
        } else if (currentNode === 'wall') {
            setWalls((prev = []) => {
                const isWall = prev.some(node => node.x === row && node.y === col);

                if (isWall && !toggleTile) {
                    // Remove the wall if it exists
                    return prev.filter(node => !(node.x === row && node.y === col));
                } else if (!isWall && toggleTile) {
                    // Add the wall if it doesn't exist
                    return [...prev, position];
                }
                return prev; // No changes
            });
        }
    };

    /**
     * Checks if a tile is a wall.
     * @param x - The row index of the tile.
     * @param y - The column index of the tile.
     * @returns True if the tile is a wall, otherwise false.
     */
    const isWallTile = (x: number, y: number) => {
        return walls?.some(wall => wall.x === x && wall.y === y);
    };

    /**
     * Checks if a node is in the closed set.
     * @param node - The node to check.
     * @param closedNodesLocal - The list of closed nodes.
     * @returns True if the node is in the closed set, otherwise false.
     */
    const isClosedNode = (node: Coord, closedNodesLocal: Node[]) => {
        return closedNodesLocal.some(closedNode => closedNode.x === node.x && closedNode.y === node.y);
    };

    /**
     * Gets valid neighboring nodes for the current node, considering movement constraints.
     * @param node - The current node.
     * @param closedNodesLocal - The list of closed nodes.
     * @returns A list of valid neighboring coordinates.
     */
    const getValidNeighbors = (node: Node, closedNodesLocal: Node[]) => {
        const straight: Coord[] = [
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
        ];

        const diagonal: Coord[] = [
            { x: -1, y: 1 },
            { x: -1, y: -1 },
            { x: 1, y: 1 },
            { x: 1, y: -1 },
        ];

        let directions = diagonalMovement ? [...straight, ...diagonal] : straight;

        return directions
            .map(direction => ({ x: direction.x + node.x, y: direction.y + node.y }))
            .filter(neighbor => {
                const withinBounds = neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height;
                const notWall = !isWallTile(neighbor.x, neighbor.y);
                const notClosed = !isClosedNode(neighbor, closedNodesLocal);
                return withinBounds && notWall && notClosed;
            });
    };

    /**
     * Calculates the diagonal distance heuristic to the end node.
     * @param node - The node to calculate the distance for.
     * @returns The diagonal distance to the end node.
     */
    const getDiagonalDistance = (node: Coord) => {
        let dx = Math.abs(node.x - end.x);
        let dy = Math.abs(node.y - end.y);
        return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
    };

    /**
     * Calculates the Manhattan distance heuristic to the end node.
     * @param node - The node to calculate the distance for.
     * @returns The Manhattan distance to the end node.
     */
    const getManhattanDistance = (node: Coord) => {
        let dx = Math.abs(node.x - end.x);
        let dy = Math.abs(node.y - end.y);
        return D * (dx + dy);
    };

    /**
     * Starts the A* pathfinding algorithm, updating the grid state as it progresses.
     */
    const startPathFind = async () => {
        reset(); // Clear the grid and states
        let count = 0;

        if (start && end) {
            let openNodesLocal: Node[] = [{
                x: start.x,
                y: start.y,
                gCost: 0,
                hCost: diagonalMovement ? getDiagonalDistance(start) : getManhattanDistance(start),
            }];
            let closedNodesLocal: Node[] = [];

            while (openNodesLocal.length > 0) {
                // Find node with least fCost
                let currentNode = openNodesLocal.reduce((minItem, currentItem) =>
                    (currentItem.gCost + currentItem.hCost) <= (minItem.gCost + minItem.hCost) ? currentItem : minItem
                );

                openNodesLocal = openNodesLocal.filter(node => !(node.x === currentNode.x && node.y === currentNode.y));
                closedNodesLocal.push(currentNode);

                if (currentNode.x === end.x && currentNode.y === end.y) break;

                const neighbors = getValidNeighbors(currentNode, closedNodesLocal);

                for (const neighbor of neighbors) {
                    const gCost = currentNode.gCost + (neighbor.x !== currentNode.x && neighbor.y !== currentNode.y ? D2 : D);

                    let hCost = diagonalMovement ? getDiagonalDistance(neighbor) : getManhattanDistance(neighbor)

                    const openNodeIndex = openNodesLocal.findIndex(node => node.x === neighbor.x && node.y === neighbor.y);
                    if (openNodeIndex === -1 || gCost <= openNodesLocal[openNodeIndex].gCost) {
                        const updatedNeighbor = { x: neighbor.x, y: neighbor.y, gCost, hCost, parent: currentNode };
                        if (openNodeIndex === -1) openNodesLocal.push(updatedNeighbor);
                        else openNodesLocal[openNodeIndex] = updatedNeighbor;
                    }
                }

                setOpenNodes(openNodesLocal);
                setClosedNodes(closedNodesLocal);
                count++;

                if (!instant && count % speed === 0) await new Promise(resolve => setTimeout(resolve, 1));
            }

            // Trace the path
            let path: Coord[] = [];
            let current: Node | undefined = closedNodesLocal.find(node => node.x === end.x && node.y === end.y);

            if (current)
                setDistance(current.gCost)

            while (current) {
                path.push({ x: current.x, y: current.y });
                current = current.parent;
            }

            setNodePath(path.reverse());
            setIterations(count)
        }
    };

    /**
     * Handles mouse-down events to initiate interactions such as toggling walls.
     * @param row - Row index of the clicked tile.
     * @param col - Column index of the clicked tile.
     */
    const handleMouseDown = (row: number, col: number) => {
        setMouseDown(true);
        setToggleTile(!isWallTile(row, col));
        handleNodeClick(row, col);
    };

    /**
     * Handles mouse-enter events to toggle walls while dragging.
     * @param row - Row index of the hovered tile.
     * @param col - Column index of the hovered tile.
     */
    const handleMouseEnter = (row: number, col: number) => {
        if (mouseDown && currentNode === "wall") {
            handleNodeClick(row, col);
        }
    };

    /**
     * Handles mouse-up events to stop drag interactions.
     */
    const handleMouseUp = () => {
        setMouseDown(false);
    };

    /**
     * Effect to add a mouse-up event listener for stopping drag interactions globally.
     */
    useEffect(() => {
        // Add mouseup listener on the whole document to ensure mouse release outside the grid also stops dragging
        document.addEventListener("mouseup", handleMouseUp);
        return () => document.removeEventListener("mouseup", handleMouseUp);
    }, []);

    useEffect(() => {
        // Reset states when dimensions change
        reset(); // Clear pathfinding data
        setWalls([]); // Clear walls
        setStart({ x: 0, y: 0 }); // Reset start position
        setEnd({ x: Math.min(1, width - 1), y: Math.min(1, height - 1) }); // Reset end position within bounds
    }, [width, height]);



    return (
        <div className="items-center justify-center flex mt-2">
            <div className="justify-center w-11/12 flex flex-col">
                {/* UI for controls */}
                <Card className="flex justify-center items-center gap-2 m-2 p-2">
                    <div className={`flex flex-col gap-2`}>
                        <Label># of nodes explored: {iterations}</Label>
                        <Label>Length of Path: {distance / 10}</Label>
                    </div>
                    <div className={`flex flex-col`}>
                        <div className={`flex flex-col`}>
                            <div className={`flex gap-2`}>
                                <Card className={`flex gap-2 p-2`}>
                                    <Button onClick={generateMaze}>
                                        Generate Maze
                                    </Button>
                                </Card>
                                <Card className={`flex items-center gap-2 p-2`}>
                                    Grid Dimensions:
                                    <Input type="number" max={WIDTH} min={5} value={width} className="w-20 text-center"
                                           onChange={(e) => handleWidthChange(e)}
                                    />
                                    x
                                    <Input type="number" max={HEIGHT} min={5} value={height}
                                           className="w-20 text-center"
                                           onChange={(e) => handleHeightChange(e)}

                                    />
                                </Card>
                                <Card className={`gap-2 p-2 flex items-center`}>
                                    Nodes:
                                    <Button
                                        onClick={() => {
                                            setCurrentNode("start");
                                        }}
                                        className={`${colorClasses.blue} aspect-square`}>
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setCurrentNode("end");
                                        }}
                                        className={`${colorClasses.red} aspect-square`}>
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setCurrentNode("wall");
                                        }}
                                        className={`${colorClasses.grey} aspect-square`}>
                                    </Button>
                                </Card>
                            </div>
                            <div className={`flex`}>
                                <Button onClick={startPathFind} className={`m-2`}>
                                    Start A* Pathfinding
                                </Button>
                                <Button onClick={reset} className={`m-2`}>
                                    Clear Pathfind
                                </Button>
                                <Button onClick={resetWalls} className={`m-2`}>
                                    Clear Walls
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <Switch id="diagonal"
                                            checked={diagonalMovement}
                                            onCheckedChange={setDiagonalMovement}
                                    />
                                    <Label htmlFor="diagonal">Toggle Diagonal Pathfind</Label>
                                    <Switch id="instant"
                                            checked={instant}
                                            onCheckedChange={setInstant}
                                    />
                                    <Label htmlFor="instant">Toggle Instant Pathfind</Label>
                                    {!instant && <div className="flex flex-col gap-2">
                                        <Label htmlFor="speed">Speed of Pathfind</Label>
                                        <Slider value={[speed]} onValueChange={(value) => setSpeed(value[0])} max={50}
                                                step={1} min={1} id="speed"/>
                                    </div>}

                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card className="flex justify-center items-center gap-2 p-2 m-2">
                    <div
                        className={`grid `}
                        style={{
                            gridTemplateColumns: `repeat(${width}, 1fr)`,
                            gridTemplateRows: `repeat(${height}, 1fr)`
                        }}
                    >
                    {/* Render grid tiles */}
                        {Array.from({ length: height }).map((_, rowIndex) =>
                            Array.from({ length: width }).map((_, colIndex) => {
                                const isOpen = openNodes.some(openNode => openNode.x === colIndex && openNode.y === rowIndex);
                                const isClosed = closedNodes.some(closedNode => closedNode.x === colIndex && closedNode.y === rowIndex);
                                const isStart = start.x === colIndex && start.y === rowIndex;
                                const isEnd = end.x === colIndex && end.y === rowIndex;
                                const isWall = walls?.some(wall => wall.x === colIndex && wall.y === rowIndex);
                                const isPath = nodePath.some(p => p.x === colIndex && p.y === rowIndex);
                                let tileColor = ""
                                if (isStart) tileColor = colorClasses.blue;
                                else if (isEnd) tileColor = colorClasses.red;
                                else if (isWall) tileColor = colorClasses.grey;
                                else if (isPath) tileColor = colorClasses.green;
                                else if (isOpen) tileColor = colorClasses.default;
                                else if (isClosed) tileColor = colorClasses.orange;
                                return (
                                    <div
                                                key={`${colIndex}-${rowIndex}`}
                                                onMouseDown={() => handleMouseDown(colIndex, rowIndex)}
                                                onMouseEnter={() => handleMouseEnter(colIndex, rowIndex)}
                                                onMouseUp={handleMouseUp}
                                                className={`w-[10px] h-[10px] p-0 ${tileColor} border-gray-800 border-[0.5px]`}
                                            />


                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MapMaker;