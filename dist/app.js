"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
// app.use((req: Request, res: Response) => {
//   res.send("Hello from Express");
// });
app.use("/test", (req, res) => {
    res.send("Test Test Test");
});
app.listen(7777, () => {
    console.log("Server successfully listening on port 7777");
});
