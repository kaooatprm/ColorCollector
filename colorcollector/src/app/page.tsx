"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ColorPos from "./components/colorPos";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Performance {
  runTime: number;
  memUsage: number;
}

interface colorData {
  id: number;
  colorStyle: string;
  iconStyle: string;
}

interface ColorObject {
  colorType: string;
  colorPos: number[];
  flagColorPos: number[];
  isColorPosCollect: boolean;
  isColorFlagCollect: boolean;
}

const colorDataList = [
  {
    id: 0,
    colorStyle: "#DB1D1D",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 1,
    colorStyle: "#DB1D1D",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 2,
    colorStyle: "#10DA60",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 3,
    colorStyle: "#10DA60",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 4,
    colorStyle: "#A30FE2",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 5,
    colorStyle: "#A30FE2",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 6,
    colorStyle: "#E29C0F",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 7,
    colorStyle: "#E29C0F",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 8,
    colorStyle: "#0FB8E2",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 9,
    colorStyle: "#0FB8E2",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 10,
    colorStyle: "#0F0FE2",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 11,
    colorStyle: "#0F0FE2",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 12,
    colorStyle: "#DBE20F",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 13,
    colorStyle: "#DBE20F",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 14,
    colorStyle: "#289420",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 15,
    colorStyle: "#289420",
    iconStyle: "material-symbols:flag-rounded",
  },
  {
    id: 16,
    colorStyle: "#EA92F0",
    iconStyle: "material-symbols:circle",
  },
  {
    id: 17,
    colorStyle: "#EA92F0",
    iconStyle: "material-symbols:flag-rounded",
  },
];

export default function Home() {
  const numRows = 30;
  const numCols = 80;

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectState, setSelectState] = useState<string>("WALL");
  const [searchType, setSearchType] = useState<string>("BLIND");
  const [startPos, setStartPos] = useState<[number, number]>([13, 20]);
  const [endPos, setEndPos] = useState<[number, number]>([13, 50]);
  //const [startPos, setStartPos] = useState<[number, number]>([17, 35]);
  //const [endPos, setEndPos] = useState<[number, number]>([1, 10]);

  //const [tempColorPos, setTempColorPos] = useState<ColorObject[]>([]);
  const [colorPos, setColorPos] = useState<ColorObject[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  const [playState, setPlayState] = useState<string>("STOPPED");
  const [blindSearchPerformance, setBlindSearchPerformance] =
    useState<Performance>({ runTime: 0, memUsage: 0 });
  const [heuristicPerformance, setHeuristicSearchPerformance] =
    useState<Performance>({ runTime: 0, memUsage: 0 });
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const [grid, setGrid] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(0))
  );

  const handleMouseDown = (row: number, col: number) => {
    if (playState !== "STOPPED") return;
    const newGrid = [...grid];
    clearBoard();

    if (selectState === "WALL") {
      if (row === endPos[0] && col === endPos[1]) return;
      if (row === startPos[0] && col === startPos[1]) return;
      const isColorPosMatch = colorPos.findIndex(
        ({ colorPos }) => colorPos[0] === row && colorPos[1] === col
      );
      const isFlagColorPosMatch = colorPos.findIndex(
        ({ flagColorPos }) => flagColorPos[0] === row && flagColorPos[1] === col
      );

      if (isColorPosMatch !== -1 || isFlagColorPosMatch !== -1) {
        return;
      }
      newGrid[row][col] = newGrid[row][col] === 1 ? 0 : 1;
      setIsMouseDown(true);
    } else if (selectState === "START") {
      if (startPos) newGrid[startPos[0]][startPos[1]] = 0;
      if (row === endPos[0] && col === endPos[1]) return;
      const isColorPosMatch = colorPos.findIndex(
        ({ colorPos }) => colorPos[0] === row && colorPos[1] === col
      );
      const isFlagColorPosMatch = colorPos.findIndex(
        ({ flagColorPos }) => flagColorPos[0] === row && flagColorPos[1] === col
      );

      if (isColorPosMatch !== -1 || isFlagColorPosMatch !== -1) {
        return;
      }
      newGrid[row][col] = 2;
      setStartPos([row, col]);
    } else if (selectState === "END") {
      if (endPos) newGrid[endPos[0]][endPos[1]] = 0;
      if (row === startPos[0] && col === startPos[1]) return;
      const isColorPosMatch = colorPos.findIndex(
        ({ colorPos }) => colorPos[0] === row && colorPos[1] === col
      );
      const isFlagColorPosMatch = colorPos.findIndex(
        ({ flagColorPos }) => flagColorPos[0] === row && flagColorPos[1] === col
      );

      if (isColorPosMatch !== -1 || isFlagColorPosMatch !== -1) {
        return;
      }
      newGrid[row][col] = 3;
      setEndPos([row, col]);
    } else if (selectState === "COLOR") {
      console.log("Selected Index : ", selectedColorIndex);

      if (row === endPos[0] && col === endPos[1]) return;
      if (row === startPos[0] && col === startPos[1]) return;

      const isColorPosMatch = colorPos.findIndex(
        ({ colorPos }) => colorPos[0] === row && colorPos[1] === col
      );
      const isFlagColorPosMatch = colorPos.findIndex(
        ({ flagColorPos }) => flagColorPos[0] === row && flagColorPos[1] === col
      );

      if (isColorPosMatch !== -1 || isFlagColorPosMatch !== -1) {
        if (selectState === "COLOR") {
          const foundIndex =
            isColorPosMatch !== -1 ? isColorPosMatch : isFlagColorPosMatch;

          console.log(
            "Found",
            foundIndex,
            colorPos[foundIndex].colorType,
            colorDataList[selectedColorIndex].colorStyle
          );

          setColorPos((prev) => {
            const currentData = [...prev];

            if (
              isColorPosMatch !== -1 &&
              currentData[foundIndex].colorType ===
                colorDataList[selectedColorIndex].colorStyle &&
              selectedColorIndex % 2 === 0
            ) {
              currentData[foundIndex].colorPos = [9999, 9999];
            } else if (
              isFlagColorPosMatch !== -1 &&
              currentData[foundIndex].colorType ===
                colorDataList[selectedColorIndex].colorStyle &&
              selectedColorIndex % 2 !== 0
            ) {
              currentData[foundIndex].flagColorPos = [9999, 9999];
            }

            return currentData.filter(
              (item) =>
                !(
                  item.colorPos[0] === 9999 &&
                  item.colorPos[1] === 9999 &&
                  item.flagColorPos[0] === 9999 &&
                  item.flagColorPos[1] === 9999
                )
            );
          });

          console.log(colorPos);
        }

        return;
      }

      setColorPos((prev) => {
        const selectedColor = colorDataList[selectedColorIndex];

        if (!selectedColor) {
          return prev;
        }

        const { colorStyle } = selectedColor;
        const existingIndex = prev.findIndex(
          (item) => item.colorType === colorStyle
        );

        let updatedData = [...prev];

        if (existingIndex !== -1) {
          updatedData = updatedData.map((item, index) => {
            if (index === existingIndex) {
              newGrid[row][col] = 0;
              return {
                ...item,
                colorPos:
                  selectedColorIndex % 2 === 0
                    ? item.colorPos[0] === row && item.colorPos[1] === col
                      ? [9999, 9999]
                      : [row, col]
                    : item.colorPos,

                flagColorPos:
                  selectedColorIndex % 2 !== 0
                    ? item.flagColorPos[0] === row &&
                      item.flagColorPos[1] === col
                      ? [9999, 9999]
                      : [row, col]
                    : item.flagColorPos,
              };
            }
            newGrid[row][col] = 0;
            return item;
          });
        } else {
          updatedData.push({
            colorType: colorStyle,
            colorPos: selectedColorIndex % 2 === 0 ? [row, col] : [9999, 9999],
            flagColorPos:
              selectedColorIndex % 2 !== 0 ? [row, col] : [9999, 9999],
            isColorPosCollect: false,
            isColorFlagCollect: false,
          });
        }
        newGrid[row][col] = 0;
        return updatedData;
      });
    }

    setGrid(newGrid);
  };

  useEffect(() => {
    console.log(colorPos);
  }, [colorPos]);

  const handleMouseEnter = (row: number, col: number) => {
    if (playState !== "STOPPED") return;

    const isColorPosMatch = colorPos?.some(
      ({ colorPos }) => colorPos[0] === row && colorPos[1] === col
    );
    const isFlagColorPosMatch = colorPos?.some(
      ({ flagColorPos }) => flagColorPos[0] === row && flagColorPos[1] === col
    );

    if (isColorPosMatch || isFlagColorPosMatch) return;
    if (!isMouseDown || selectState !== "WALL") return;
    if (row === endPos[0] && col === endPos[1]) return;
    if (row === startPos[0] && col === startPos[1]) return;
    const newGrid = [...grid];
    newGrid[row][col] = newGrid[row][col] === 0 ? 1 : 0;
    setGrid(newGrid);
  };

  const handleClickChangeState = (type: string) => {
    setSelectState(type);
  };

  const clearBoard = () => {
    const newGrid = [...grid];

    newGrid.map((row, rowindex) => {
      newGrid[rowindex].map((col, colindex) => {
        if (newGrid[rowindex][colindex] !== 1) {
          newGrid[rowindex][colindex] = 0;
        }
      });
    });

    setGrid(newGrid);
  };

  /* useEffect(() => {
    setColorPos(tempColorPos.map((item) => ({ ...item })));
  }, []);*/

  const handleFindPath = () => {
    setPlayState("START");
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    const windowPerformance = window.performance as any;
    let totalMemory = windowPerformance.memory.usedJSHeapSize;
    const startTime = performance.now();

    console.log("Start path");
    clearBoard();

    const newGrid = [...grid];
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0], // 4 ทิศทาง: ขวา, ล่าง, ซ้าย, ขึ้น
    ];

    let queue: Array<[number, number]> = [startPos];
    let visited = Array.from({ length: numRows }, () =>
      Array(numCols).fill(false)
    );
    let parent: Array<Array<[number, number] | null>> = Array.from(
      { length: numRows },
      () => Array(numCols).fill(null)
    );
    visited[startPos[0]][startPos[1]] = true;
    newGrid[startPos[0]][startPos[1]] = 10;

    let queueIndex = 0;
    let foundEnd = false;

    const resetBoardForColorFinding = (startRow: number, startCol: number) => {
      newGrid.map((row, rowindex) => {
        newGrid[rowindex].map((col, colindex) => {
          if (newGrid[rowindex][colindex] !== 1) {
            newGrid[rowindex][colindex] = 0;
          }
        });
      });
      queue = [[startRow, startCol]];
      queueIndex = 0;
      visited = Array.from({ length: numRows }, () =>
        Array(numCols).fill(false)
      );
      parent = Array.from({ length: numRows }, () => Array(numCols).fill(null));
      visited[startRow][startCol] = true;
      newGrid[startRow][startCol] = 10;
      setGrid([...newGrid]);
    };

    if (colorPos && colorPos.length > 0) {
      //setColorPos(tempColorPos.map((item) => ({ ...item })));
      let colorFinderSize = colorPos.length;
      let currentColorFinderIndex = 0;
      let currentColorFinderState = 0; // 0 = find color, 1 = find hole

      const processStep = () => {
        const windowPerformance = window.performance as any;
        totalMemory =
          (totalMemory + windowPerformance.memory.usedJSHeapSize) / 2;

        if (queueIndex >= queue.length || foundEnd) {
          const endTime = performance.now();
          console.log("queueIndex", queueIndex);
          console.log("queue.length", queue.length);
          console.log(`Runtime: ${endTime - startTime} ms`);
          setBlindSearchPerformance({
            runTime: endTime - startTime,
            memUsage: totalMemory,
          });
          setPlayState("END");
          return;
        }

        const [row, col] = queue[queueIndex];
        queueIndex++;

        for (let [dx, dy] of directions) {
          const newRow = row + dx;
          const newCol = col + dy;

          if (
            newRow >= 0 &&
            newRow < numRows &&
            newCol >= 0 &&
            newCol < numCols &&
            !visited[newRow][newCol] &&
            grid[newRow][newCol] !== 1
          ) {
            visited[newRow][newCol] = true;
            queue.push([newRow, newCol]);
            parent[newRow][newCol] = [row, col];
            newGrid[newRow][newCol] = 10;

            if (colorFinderSize > 0) {
              if (
                currentColorFinderState === 0 &&
                colorPos[currentColorFinderIndex].colorPos[0] === newRow &&
                colorPos[currentColorFinderIndex].colorPos[1] === newCol
              ) {
                console.log("Found Color Index", currentColorFinderIndex);
                currentColorFinderState = 1;
                resetBoardForColorFinding(
                  colorPos[currentColorFinderIndex].colorPos[0],
                  colorPos[currentColorFinderIndex].colorPos[1]
                );

                setColorPos((prev) => {
                  const current = [...prev];
                  current[currentColorFinderIndex].isColorPosCollect = true;
                  return current;
                });
              } else if (
                currentColorFinderState === 1 &&
                colorPos[currentColorFinderIndex].flagColorPos[0] === newRow &&
                colorPos[currentColorFinderIndex].flagColorPos[1] === newCol
              ) {
                const foundIndex = currentColorFinderIndex;
                console.log("Found Color Flag Index", foundIndex);

                currentColorFinderState = 0;
                resetBoardForColorFinding(
                  colorPos[foundIndex].flagColorPos[0],
                  colorPos[foundIndex].flagColorPos[1]
                );
                colorFinderSize--;

                setColorPos((prev) => {
                  const current = [...prev];
                  current[foundIndex].isColorFlagCollect = true;
                  console.log(
                    "Index",
                    foundIndex,
                    current[foundIndex].isColorFlagCollect
                  );
                  return current;
                });

                currentColorFinderIndex += 1;
              }
            } else {
              if (newRow === endPos[0] && newCol === endPos[1]) {
                console.log("Found! NA");
                foundEnd = true;
                const endTime = performance.now();
                console.log(`Runtime: ${endTime - startTime} ms`);

                setBlindSearchPerformance({
                  runTime: endTime - startTime,
                  memUsage: totalMemory,
                });
                setPlayState("END");
                foundEnd = true;
                setGrid([...newGrid]);
                return;
              }
            }
          }
        }

        if (!foundEnd) {
          const ID = requestAnimationFrame(processStep);
          setAnimationFrameId(ID);
        }
      };

      const ID = requestAnimationFrame(processStep);
      setAnimationFrameId(ID);
    } else {
      const processStep = () => {
        const windowPerformance = window.performance as any;
        totalMemory =
          (totalMemory + windowPerformance.memory.usedJSHeapSize) / 2;

        if (queueIndex >= queue.length || foundEnd) {
          const endTime = performance.now();
          console.log(`Runtime: ${endTime - startTime} ms`);
          setBlindSearchPerformance({
            runTime: endTime - startTime,
            memUsage: totalMemory,
          });
          setPlayState("END");
          return;
        }

        const [row, col] = queue[queueIndex];
        queueIndex++;

        for (let [dx, dy] of directions) {
          const newRow = row + dx;
          const newCol = col + dy;

          if (
            newRow >= 0 &&
            newRow < numRows &&
            newCol >= 0 &&
            newCol < numCols &&
            !visited[newRow][newCol] &&
            grid[newRow][newCol] !== 1
          ) {
            visited[newRow][newCol] = true;
            queue.push([newRow, newCol]);
            parent[newRow][newCol] = [row, col];
            newGrid[newRow][newCol] = 10;
            if (newRow === endPos[0] && newCol === endPos[1]) {
              console.log("Found! NA");
              const endTime = performance.now();
              console.log(`Runtime: ${endTime - startTime} ms`);

              setBlindSearchPerformance({
                runTime: endTime - startTime,
                memUsage: totalMemory,
              });
              setPlayState("END");
              foundEnd = true;
              setGrid([...newGrid]);
              return;
            }
          }
        }

        setGrid([...newGrid]);
        const ID = requestAnimationFrame(processStep);
        setAnimationFrameId(ID);
      };

      const ID = requestAnimationFrame(processStep);
      setAnimationFrameId(ID);
    }
  };

  const handleFindPathWithHeuristic = () => {
    setPlayState("START");
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    const windowPerformance = window.performance as any;
    let totalMemory = windowPerformance.memory.usedJSHeapSize;
    const startTime = performance.now(); // เริ่มจับเวลา

    clearBoard();
    const newGrid = [...grid];
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0], // 4 ทิศทาง: ขวา, ล่าง, ซ้าย, ขึ้น
    ];

    const calculateHeuristic = (
      row: number,
      col: number,
      endRow: number,
      endCol: number
    ) => {
      return Math.abs(row - endRow) + Math.abs(col - endCol);
    };

    let queue: Array<{
      row: number;
      col: number;
      g: number;
      h: number;
      f: number;
      parent: [number, number] | null;
    }> = [];
    let visited = Array.from({ length: numRows }, () =>
      Array(numCols).fill(false)
    );
    let parent: Array<Array<[number, number] | null>> = Array.from(
      { length: numRows },
      () => Array(numCols).fill(null)
    );

    visited[startPos[0]][startPos[1]] = true;
    newGrid[startPos[0]][startPos[1]] = 10;
    let foundEnd = false;

    const resetBoardForColorFinding = (
      startRow: number,
      startCol: number,
      endRow: number,
      endCol: number
    ) => {
      newGrid.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (newGrid[rowIndex][colIndex] !== 1) {
            newGrid[rowIndex][colIndex] = 0;
          }
        });
      });
      queue = [];
      queue.push({
        row: startRow,
        col: startCol,
        g: 0,
        h: calculateHeuristic(startRow, startCol, endRow, endCol),
        f: 0,
        parent: null,
      });
      visited = Array.from({ length: numRows }, () =>
        Array(numCols).fill(false)
      );
      parent = Array.from({ length: numRows }, () => Array(numCols).fill(null));

      visited[startRow][startCol] = true;
      newGrid[startRow][startCol] = 10;
      setGrid([...newGrid]);
    };

    if (colorPos && colorPos.length > 0) {
      //setColorPos(tempColorPos.map((item) => ({ ...item })));
      let colorFinderSize = colorPos.length;
      let currentColorFinderIndex = 0;
      let currentColorFinderState = 0; // 0 = find color, 1 = find hole
      let tempEndPos = [
        colorPos[currentColorFinderIndex].colorPos[0],
        colorPos[currentColorFinderIndex].colorPos[1],
      ];

      queue.push({
        row: startPos[0],
        col: startPos[1],
        g: 0,
        h: calculateHeuristic(
          startPos[0],
          startPos[1],
          tempEndPos[0],
          tempEndPos[1]
        ),
        f: 0,
        parent: null,
      });
      const processStep = () => {
        const windowPerformance = window.performance as any;
        totalMemory =
          (totalMemory + windowPerformance.memory.usedJSHeapSize) / 2;
        //console.log(totalMemory);
        if (queue.length === 0 || foundEnd) {
          const endTime = performance.now(); // จับเวลาเมื่อเสร็จสิ้น
          console.log(`Runtime: ${endTime - startTime} ms`);

          setHeuristicSearchPerformance({
            runTime: endTime - startTime,
            memUsage: totalMemory,
          });
          setPlayState("END");

          return;
        }

        const current = queue.sort((a, b) => a.f - b.f).shift()!;
        const { row, col, g, h, parent: currentParent } = current;

        if (colorFinderSize > 0) {
          if (
            currentColorFinderState === 0 &&
            colorPos[currentColorFinderIndex].colorPos[0] === row &&
            colorPos[currentColorFinderIndex].colorPos[1] === col
          ) {
            console.log("Found Color Index", currentColorFinderIndex);
            currentColorFinderState = 1;

            tempEndPos = [
              colorPos[currentColorFinderIndex].flagColorPos[0],
              colorPos[currentColorFinderIndex].flagColorPos[1],
            ];

            setColorPos((prev) => {
              const current = [...prev];
              current[currentColorFinderIndex].isColorPosCollect = true;
              return current;
            });

            resetBoardForColorFinding(
              colorPos[currentColorFinderIndex].colorPos[0],
              colorPos[currentColorFinderIndex].colorPos[1],
              tempEndPos[0],
              tempEndPos[1]
            );
          } else if (
            currentColorFinderState === 1 &&
            colorPos[currentColorFinderIndex].flagColorPos[0] === row &&
            colorPos[currentColorFinderIndex].flagColorPos[1] === col
          ) {
            const foundIndex = currentColorFinderIndex;
            console.log("Found Color Flag Index", foundIndex);
            currentColorFinderState = 0;

            if (foundIndex + 1 < colorPos.length) {
              tempEndPos = [
                colorPos[foundIndex + 1].colorPos[0],
                colorPos[foundIndex + 1].colorPos[1],
              ];
            } else {
              tempEndPos = [endPos[0], endPos[1]];
            }

            setColorPos((prev) => {
              const current = [...prev];
              current[foundIndex].isColorFlagCollect = true;
              console.log(
                "Index",
                foundIndex,
                current[foundIndex].isColorFlagCollect
              );
              return current;
            });

            resetBoardForColorFinding(
              colorPos[foundIndex].flagColorPos[0],
              colorPos[foundIndex].flagColorPos[1],
              tempEndPos[0],
              tempEndPos[1]
            );

            colorFinderSize--;
            currentColorFinderIndex += 1;
          }
        } else {
          if (row === endPos[0] && col === endPos[1]) {
            foundEnd = true;
            setGrid([...newGrid]);
            const endTime = performance.now();
            console.log(`Runtime: ${endTime - startTime} ms`);
            setHeuristicSearchPerformance({
              runTime: endTime - startTime,
              memUsage: totalMemory,
            });
            setPlayState("END");
            return;
          }
        }

        for (let [dx, dy] of directions) {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 &&
            newRow < numRows &&
            newCol >= 0 &&
            newCol < numCols &&
            !visited[newRow][newCol] &&
            grid[newRow][newCol] !== 1
          ) {
            visited[newRow][newCol] = true;
            const newG = g + 1;
            const newH = calculateHeuristic(
              newRow,
              newCol,
              tempEndPos[0],
              tempEndPos[1]
            );
            const newF = newG + newH;
            queue.push({
              row: newRow,
              col: newCol,
              g: newG,
              h: newH,
              f: newF,
              parent: [row, col],
            });
            newGrid[newRow][newCol] = 10;
          }
        }

        setGrid([...newGrid]);
        const ID = requestAnimationFrame(processStep);
        setAnimationFrameId(ID);
      };

      const ID = requestAnimationFrame(processStep);
      setAnimationFrameId(ID);
    } else {
      queue.push({
        row: startPos[0],
        col: startPos[1],
        g: 0,
        h: calculateHeuristic(startPos[0], startPos[1], endPos[0], endPos[1]),
        f: 0,
        parent: null,
      });
      const processStep = () => {
        const windowPerformance = window.performance as any;
        totalMemory =
          (totalMemory + windowPerformance.memory.usedJSHeapSize) / 2;
        //console.log(totalMemory);
        if (queue.length === 0 || foundEnd) {
          const endTime = performance.now(); // จับเวลาเมื่อเสร็จสิ้น
          console.log(`Runtime: ${endTime - startTime} ms`);

          setHeuristicSearchPerformance({
            runTime: endTime - startTime,
            memUsage: totalMemory,
          });
          setPlayState("END");

          return;
        }

        const current = queue.sort((a, b) => a.f - b.f).shift()!;
        const { row, col, g, h, parent: currentParent } = current;

        if (row === endPos[0] && col === endPos[1]) {
          foundEnd = true;
          setGrid([...newGrid]);
          const endTime = performance.now();
          console.log(`Runtime: ${endTime - startTime} ms`);
          setHeuristicSearchPerformance({
            runTime: endTime - startTime,
            memUsage: totalMemory,
          });
          setPlayState("END");
          return;
        }

        for (let [dx, dy] of directions) {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 &&
            newRow < numRows &&
            newCol >= 0 &&
            newCol < numCols &&
            !visited[newRow][newCol] &&
            grid[newRow][newCol] !== 1
          ) {
            visited[newRow][newCol] = true;
            const newG = g + 1;
            const newH = calculateHeuristic(
              newRow,
              newCol,
              endPos[0],
              endPos[1]
            );
            const newF = newG + newH;
            queue.push({
              row: newRow,
              col: newCol,
              g: newG,
              h: newH,
              f: newF,
              parent: [row, col],
            });
            newGrid[newRow][newCol] = 10;
          }
        }

        setGrid([...newGrid]);
        const ID = requestAnimationFrame(processStep);
        setAnimationFrameId(ID);
      };

      const ID = requestAnimationFrame(processStep);
      setAnimationFrameId(ID);
    }
  };

  const handleVisual = () => {
    if (playState === "END") {
      clearBoard();

      setColorPos((prev) =>
        prev.map((item) => ({
          ...item,
          isColorPosCollect: false,
          isColorFlagCollect: false,
        }))
      );

      setPlayState("STOPPED");
      return;
    }

    if (playState !== "STOPPED") return;

    if (searchType === "BLIND") {
      handleFindPath();
    } else if (searchType === "HEURISTIC") {
      handleFindPathWithHeuristic();
    }
  };

  const handleClickColorPos = (id: number) => {
    console.log("HELLO ", id);
    setSelectedColorIndex(id);
  };

  const handleClickColorPosFlag = (id: number) => {
    console.log("HELLO FLAG ", id);
    setSelectedColorIndex(id);
  };

  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;

    const reorderedItems = [...colorPos];

    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);

    setColorPos(reorderedItems);
  };
  

  return (
    <div className="flex relative flex-col w-full h-full">
      <div className="flex justify-center items-center w-full">4Jaturatep ColorCollector</div>
      <div className="flex gap-x-5 flex-row mt-5 justify-center items-center">
        <div
          className={`flex flex-row px-2 py-1 rounded-md border border-gray-600 ${
            selectState == "WALL"
              ? " bg-gray-300"
              : "cursor-pointer hover:bg-gray-200"
          }`}
          onClick={() => handleClickChangeState("WALL")}
        >
          <div className="flex justify-center items-center mr-1">
            <Icon icon="memory:wall-fill" width={20} height={20} />
          </div>
          <div className="flex justify-center items-center">Wall</div>
        </div>
        <div
          className={`flex flex-row px-2 py-1 rounded-md border border-gray-600 ${
            selectState == "START"
              ? " bg-gray-300"
              : "cursor-pointer hover:bg-gray-200"
          }`}
          onClick={() => handleClickChangeState("START")}
        >
          <div className="flex justify-center items-center">
            <Icon
              icon="material-symbols:play-arrow-rounded"
              width={20}
              height={20}
            />
          </div>
          <div className="flex justify-center items-center">Start Point</div>
        </div>
        <div
          className={`flex flex-row px-2 py-1 rounded-md border border-gray-600 ${
            selectState == "END"
              ? " bg-gray-300"
              : "cursor-pointer hover:bg-gray-200"
          }`}
          onClick={() => handleClickChangeState("END")}
        >
          <div className="flex justify-center items-center mr-1">
            <Icon icon="material-symbols:flag-rounded" width={20} height={20} />
          </div>
          <div className="flex justify-center items-center">End</div>
        </div>
        <div
          className={`flex flex-row px-2 py-1 rounded-md border border-gray-600 ${
            selectState == "COLOR"
              ? " bg-gray-300"
              : "cursor-pointer hover:bg-gray-200"
          }`}
          onClick={() => handleClickChangeState("COLOR")}
        >
          <div className="flex justify-center items-center mr-1">
            <Icon icon="ic:baseline-color-lens" width={20} height={20} />
          </div>
          <div className="flex justify-center items-center">
            Color Collector
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-x-5 mt-5 w-full justify-center">
        <div
          className={`flex px-2 py-1 rounded-md text-white ${
            searchType === "BLIND"
              ? "bg-green-700"
              : "cursor-pointer bg-green-400 hover:bg-green-300"
          }`}
          onClick={() => setSearchType("BLIND")}
        >
          Blind Search
        </div>
        <div
          className={`flex px-2 py-1 rounded-md text-white border border-gray-200 ${
            playState === "STOPPED" || playState === "END"
              ? "cursor-pointer bg-[#888888] hover:bg-[#adadad]"
              : "bg-[#6e6e6e]"
          }`}
          onClick={handleVisual}
        >
          {playState === "STOPPED"
            ? "Start Visual"
            : playState === "END"
            ? "Reset Board"
            : "Running Task.."}
        </div>
        <div
          className={`flex px-2 py-1 rounded-md text-white ${
            searchType === "HEURISTIC"
              ? "bg-red-700"
              : "cursor-pointer bg-red-400 hover:bg-red-300"
          }`}
          onClick={() => setSearchType("HEURISTIC")}
        >
          Heuristic Search
        </div>
      </div>
      <div className="flex flex-row w-full h-full">
        <div className="flex w-[10%] justify-center items-center">
          <div
            className={`bg-[#e7e7e7] pt-1 px-1 items-center rounded-md w-28 h-[500px] ml-3 ${
              selectState === "COLOR" ? "flex flex-col" : "hidden"
            }`}
          >
            <div className="flex">Pick Color</div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {colorDataList.map((item) => (
                <div key={item.id} className="flex cursor-pointer">
                  <ColorPos
                    id={item.id}
                    selectedIndex={selectedColorIndex}
                    iconStyle={item.iconStyle}
                    colorStyle={item.colorStyle}
                    onClick={
                      item.id % 2 === 0
                        ? handleClickColorPos
                        : handleClickColorPosFlag
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-[80%]">
          <div className="flex mt-5 justify-center items-center w-full">
            <table
              className="border border-collapse border-black w-full"
              onMouseUp={() => setIsMouseDown(false)}
            >
              <tbody>
                {grid.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`w-6 h-6 cursor-pointer border border-black ${
                          cell === 1
                            ? "bg-black"
                            : cell === 10
                            ? "bg-blue-400"
                            : "bg-white hover:bg-gray-300"
                        }`}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() =>
                          handleMouseEnter(rowIndex, colIndex)
                        }
                      >
                        {rowIndex === startPos[0] &&
                          colIndex === startPos[1] &&
                          colorPos && (
                            <div
                              className={`w-full h-full justify-center items-center ${
                                colorPos.length > 0 &&
                                colorPos[0].isColorPosCollect
                                  ? "hidden"
                                  : "flex"
                              }`}
                            >
                              <Icon
                                icon="material-symbols:play-arrow-rounded"
                                width={20}
                                height={20}
                              />
                            </div>
                          )}
                        {rowIndex === endPos[0] && colIndex === endPos[1] && (
                          <div className="flex justify-center items-center">
                            <Icon
                              icon="material-symbols:flag-rounded"
                              width={20}
                              height={20}
                            />
                          </div>
                        )}
                        {(() => {
                          const matchedIndex = colorPos?.findIndex(
                            ({ colorPos }) =>
                              colorPos[0] === rowIndex &&
                              colorPos[1] === colIndex
                          );
                          const matchedFlag =
                            matchedIndex !== undefined &&
                            matchedIndex !== -1 &&
                            colorPos
                              ? colorPos[matchedIndex]
                              : undefined;

                          return matchedFlag ? (
                            <div
                              className={`w-full h-full justify-center items-center ${
                                colorPos &&
                                matchedIndex !== undefined &&
                                colorPos[matchedIndex].isColorFlagCollect
                                  ? "hidden"
                                  : "flex"
                              }`}
                            >
                              <Icon
                                icon="material-symbols:circle"
                                width={20}
                                height={20}
                                style={{ color: matchedFlag.colorType }}
                              />
                            </div>
                          ) : null;
                        })()}
                        {(() => {
                          const matchedIndex = colorPos?.findIndex(
                            ({ flagColorPos }) =>
                              flagColorPos[0] === rowIndex &&
                              flagColorPos[1] === colIndex
                          );
                          const matchedFlag =
                            matchedIndex !== -1 && matchedIndex !== undefined
                              ? colorPos?.[matchedIndex]
                              : undefined;

                          return matchedFlag ? (
                            <div
                              className={`w-full h-full justify-center items-center ${
                                colorPos &&
                                matchedIndex !== undefined &&
                                matchedIndex + 1 < colorPos.length &&
                                colorPos[matchedIndex + 1].isColorPosCollect
                                  ? "hidden"
                                  : "flex"
                              }`}
                            >
                              <Icon
                                icon="material-symbols:flag-rounded"
                                width={20}
                                height={20}
                                style={{ color: matchedFlag.colorType }}
                              />
                            </div>
                          ) : null;
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex w-[10%] justify-center items-center">
          <div
            className={`bg-[#e7e7e7] pt-1 px-1 items-center mt-20 rounded-md w-28 h-[500px] ml-3 ${
              selectState === "COLOR" ? "flex flex-col" : "hidden"
            }`}
          >
            <div className="flex">Change Order</div>
              <div className="flex flex-col h-full">
                {colorPos.length >= 0 && (
                  <div className="flex flex-col h-full">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable
                        droppableId="colors"
                        isDropDisabled={false}
                        isCombineEnabled={false}
                        ignoreContainerClipping={false}
                      >
                        {(provided) => (
                          <ul
                            className="characters text-black pt-2 px-3 h-full"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {colorPos.map((color, index) => {
                              return (
                                <Draggable
                                  key={String(index)}
                                  draggableId={String(index)}
                                  index={index}
                                >
                                  {(provided) => (
                                    <li
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="mb-2 bg-white"
                                    >
                                    <ColorPos
                                      selectedIndex={selectedColorIndex}
                                      iconStyle="material-symbols:circle"
                                      colorStyle={color.colorType}
                                    />
                                    </li>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row justify-center gap-x-20 mt-3">
        <div className="flex flex-row gap-x-2 mt-2 bg-green-500 rounded-full px-3 py-1">
          <div className="flex">Blind Search:</div>
          <div className="flex">
            {Math.round(blindSearchPerformance.runTime)} ms
          </div>
          <div className="flex">
            {Math.round(blindSearchPerformance.memUsage / 1000)} kbytes
          </div>
        </div>
        <div className="flex flex-row gap-x-2 mt-2 bg-red-500 rounded-full px-3 py-1">
          <div className="flex">Heuristic Search:</div>
          <div className="flex">
            {Math.round(heuristicPerformance.runTime)} ms
          </div>
          <div className="flex">
            {Math.round(heuristicPerformance.memUsage / 1000)} kbytes
          </div>
        </div>
      </div>
    </div>
  );
}
