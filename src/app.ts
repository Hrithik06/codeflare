import type { Request, Response } from "express";
const express = require("express");

const app = express();

app.use((req: Request, res: Response) => {
  res.send("Hello from Express");
});

app.use("/test", (req: Request, res: Response) => {
  res.send("Test Test Test");
});
app.listen(7777, () => {
  console.log("Server successfully listening on port 7777");
});
