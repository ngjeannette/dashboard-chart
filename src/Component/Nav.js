/*eslint-disable */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// <Link to="/"> Home </Link>

function Nav() {
  return (
    <nav className="panel" style={{ height: "100%", position: "fixed" }}>
      <p className="panel-heading">Chart.js</p>
      <Link
        to="/"
        className="panel-block is-active"
        style={{ padding: ".75em 1.4em" }}
      >
        <span className="panel-icon">Home</span>
      </Link>
    </nav>
  );
}
export default Nav;
