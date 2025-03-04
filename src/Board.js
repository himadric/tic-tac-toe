import React from "react";
import Cell from "./Cell";

function Board({ board, handleClick }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value ? value.value : null}
          onClick={() => handleClick(index)}
          cellType={value ? value.cellType : null}
        />
      ))}
    </div>
  );
}

export default Board;
