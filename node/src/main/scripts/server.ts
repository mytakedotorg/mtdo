#!/usr/bin/env node

import { RenderQueue } from "./renderer"
var app = require("./app");

const numTabs = parseInt(process.env.NUM_TABS || "2", 10);
const port = parseInt(process.env.PORT || "4000", 10);
RenderQueue.warmup(numTabs).then(_ => app.listen(port));
