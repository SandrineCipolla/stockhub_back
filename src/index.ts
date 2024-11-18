import express from "express";
import { rootMain } from "./Utils/logger";
import { initializeApp } from "./initializeApp";
import { selectedRuntimeMode } from "./config/runtimeMode";

rootMain.info("Starting application ...");
rootMain.info(
  "Selected runtime mode is {selectedRuntimeMode}",
  selectedRuntimeMode
);

if (process.env.NODE_ENV !== "test") {
  initializeApp();
}
