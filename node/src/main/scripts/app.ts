/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import * as express from "express";
import { NextFunction, Request, Response } from "express";
import ReactDOMServer from "react-dom/server";
import { socialHeader } from "./common/social/SocialHeader";
// Require routes
import { generateImage } from "./controllers/images";
import rison from "rison";
require("source-map-support").install();
const logger = require("morgan");
const app = express();

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  app.use(logger("combined"));
} else {
  app.use(logger("dev"));
}

const ARG = "arg";
app.use(`/api/social-image/:${ARG}`, async (req: Request, res: Response) => {
  try {
    const imgKeyAndExtension = req.params[ARG];
    const bufOrErrorMsg = await generateImage(imgKeyAndExtension);
    if (bufOrErrorMsg instanceof Buffer) {
      res
        .writeHead(200, {
          "Content-Type": "image/png",
          "Content-Length": bufOrErrorMsg.length,
        })
        .end(bufOrErrorMsg);
    } else {
      logErrorAndSend404(req, bufOrErrorMsg, res);
    }
  } catch (error) {
    logErrorAndSend404(req, error.toString(), res);
  }
});

app.use(`/api/social-header/:${ARG}`, async (req: Request, res: Response) => {
  try {
    const arg = req.params[ARG];
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });
    res.send(ReactDOMServer.renderToString(socialHeader(arg)));
  } catch (error) {
    logErrorAndSend404(req, error.toString(), res);
  }
});

function logErrorAndSend404(req: Request, errorMsg: string, res: Response) {
  console.warn("#####################");
  console.warn(req.path);
  console.warn(errorMsg);
  res.status(404).send("Not found");
}

declare global {
  interface Error {
    status?: number;
  }
}

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// development error handler will print stacktrace
if (app.get("env") === "development") {
  app.use(function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler will not leak stacktrace
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
