import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { DraftRev } from "../java2ts/DraftRev";
import { DraftPost } from "../java2ts/DraftPost";
import { PublishResult } from "../java2ts/PublishResult";

function getAllFacts(
  callback: (
    error: string | Error | null,
    documents: Foundation.FactLink[]
  ) => any
): void {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests

  const request: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "default"
  };

  fetch(Routes.FOUNDATION_DATA_INDEX, request)
    .then(function(response: Response) {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      } else {
        callback("Error retrieving Document Facts", []);
      }
    })
    .then(function(json: any) {
      callback(null, json);
    })
    .catch(function(error: TypeError) {
      callback(error, []);
    });
}

function fetchFact(
  factHash: string,
  callback: (
    error: string | Error | null,
    documentFact:
      | Foundation.DocumentFactContent
      | Foundation.VideoFactContent
      | null
  ) => any
): void {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests

  const request: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "default"
  };

  fetch(Routes.FOUNDATION_DATA + "/" + factHash + ".json", request)
    .then(function(response: Response) {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      } else {
        callback("Error retrieving Fact", null);
      }
    })
    .then(function(json: any) {
      callback(null, json);
    })
    .catch(function(error: TypeError) {
      callback(error, null);
    });
}

function isDocument(
  fact: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.DocumentFactContent {
  if (fact) {
    return (fact as Foundation.DocumentFactContent).fact.kind === "document";
  } else {
    return false;
  }
}

function isVideo(
  fact: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.VideoFactContent {
  if (fact) {
    return (fact as Foundation.VideoFactContent).fact.kind === "video";
  } else {
    return false;
  }
}

function postRequest(
  route: string,
  bodyJson: DraftPost | DraftRev,
  successCb: (json: DraftRev | PublishResult) => void
) {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests
  headers.append("Content-Type", "application/json"); // This one sends body

  const request: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: headers,
    body: JSON.stringify(bodyJson)
  };
  fetch(route, request)
    .then(
      function(response: Response) {
        const contentType = response.headers.get("content-type");
        if (
          contentType &&
          contentType.indexOf("application/json") >= 0 &&
          response.ok
        ) {
          return response.json();
        } else if (route === Routes.DRAFTS_DELETE && response.ok) {
          window.location.href = Routes.DRAFTS;
        } else {
          throw "Unexpected response from server.";
        }
      }.bind(this)
    )
    .then(
      function(json: DraftRev) {
        successCb(json);
      }.bind(this)
    )
    .catch(function(error: Error) {
      throw error;
    });
}

export { getAllFacts, fetchFact, isDocument, isVideo, postRequest };
