import type { Request, Response } from "express";
const express = require("express");

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express");
});

// app.use("/user", (req: Request, res: Response) => {
//   res.send("LOL LMFAO HAHAHA");
// });
// app.get("/user", (req: Request, res: Response) => {
//   res.send({
//     name: "Hrithik",
//   });
// });

app.post("/user", (req: Request, res: Response) => {
  console.log("Save data to DB");

  res.send("Data saved successfully in Database");
});

app.delete("/user", (req: Request, res: Response) => {
  console.log("Delete");

  res.send("Deleted successfully in Database");
});

//Advance routing

app.get("/ab?c", (req: Request, res: Response) => {
  res.send("ab?c b is optional");
});
app.get("/ab+c", (req: Request, res: Response) => {
  res.send("ab+++c can have many b's");
});

app.get("/ab*cd", (req: Request, res: Response) => {
  res.send("ab*cd there can be anything between ab and cd");
});

app.get("/a(bc)?d", (req: Request, res: Response) => {
  res.send("a(bc)?d grouping, bc is optional");
});

app.get("/a(bc)+d", (req: Request, res: Response) => {
  res.send("a(bc)+d grouping, can have many bc's");
});

//Regex

app.get(/a/, (req: Request, res: Response) => {
  res.send("Regex /a/ anything which contains 'a' ");
});

app.get(/.*fly$/, (req: Request, res: Response) => {
  res.send("Regex /.*fly$/ anything which ends with 'fly' ");
});

// Query Params
app.get("/user", (req: Request, res: Response) => {
  console.log(req.query);
  res.send("Query Params");
});

// Dynamic Routes or Params
app.get("/user/:userId/:name/:password", (req: Request, res: Response) => {
  console.log(req.params);
  res.send("Dynamic Routes ");
});
// app.use("/hello/2", (req: Request, res: Response) => {
//   res.send("Abracadabra");
// });

// app.use("/hello", (req: Request, res: Response) => {
//   res.send("Hello Hello Hello");
// });

app.use("/test", (req: Request, res: Response) => {
  res.send("Test Test Test");
});

app.listen(7777, () => {
  console.log("Server successfully listening on port 7777");
});
