#!/usr/bin/env node

import { RenderQueue } from "./renderer"
var app = require("./app");

const port = parseInt(process.env.PORT || "4000", 10);
RenderQueue.warmup().then(_ => app.listen(port));
