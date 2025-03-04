import React from "react";

function Cell({ value, onClick, cellType }) {
  let cellClass = "cell";
  if (cellType) {
    cellClass += ` cell-${cellType}`;
  }

  return (
    <div className={cellClass} onClick={onClick}>
      {value}
    </div>
  );
}

export default Cell;
