import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

export function getAllFacts(
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
    .catch(function(error: Error) {
      // Network error
      callback(error, []);
    });
}

export function fetchFact(
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
    .catch(function(error: Error) {
      // Network error
      console.log("In a catch block way over here: ", error);
      callback(error, null);
    });
}

export function isDocument(
  fact: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.DocumentFactContent {
  if (fact) {
    return (fact as Foundation.DocumentFactContent).fact.kind === "document";
  } else {
    return false;
  }
}

export function isVideo(
  fact: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.VideoFactContent {
  if (fact) {
    return (fact as Foundation.VideoFactContent).fact.kind === "video";
  } else {
    return false;
  }
}
