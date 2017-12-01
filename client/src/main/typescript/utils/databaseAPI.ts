import database, {
  CaptionMeta,
  CaptionWord,
  Database,
  VideoFact,
  User,
  Article
} from "./databaseData";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { slugify } from "./functions";
import { TakeBlock } from "../components/BlockEditor";

export function getAllVideoFacts(): VideoFact[] {
  return database.videos;
}

export function getVideoFact(videoId: string): VideoFact {
  for (let video of database.videos) {
    if (video.id === videoId) {
      return video;
    }
  }

  throw "Cannot get VideoFact for video with id: " + videoId;
}

export function getVideoFactTitle(videoId: string): string {
  let video = getVideoFact(videoId);
  if (video) {
    return video.title;
  }

  throw "Cannot get video title for video with id: " + videoId;
}

export function getVideoFactPrimaryDate(videoId: string): Date {
  let video = getVideoFact(videoId);
  if (video) {
    return video.primaryDate;
  }

  throw "Cannot get video primary date for video with id: " + videoId;
}

export function getVideoFactPrimaryDateKind(videoId: string): string {
  let video = getVideoFact(videoId);
  if (video) {
    return video.primaryDateKind;
  }

  throw "Cannot get video primary date kind for video with id: " + videoId;
}

export function getVideoFactCaptionFile(videoId: string): string {
  let video = getVideoFact(videoId);
  if (video && video.captionFile) {
    return video.captionFile;
  }

  throw "Cannot get video caption file for video with id: " + videoId;
}

export function getVideoCaptionMetaData(videoId: string): CaptionMeta {
  let video = getVideoFact(videoId);
  if (video && video.captionMeta) {
    return video.captionMeta;
  }

  throw "Cannot get video caption metadata for video with id: " + videoId;
}

export function getVideoCaptionWordMap(videoId: string): CaptionWord[] {
  const captionFile = getVideoFactCaptionFile(videoId);
  const source = require("../foundation/" + captionFile);
  if (source) {
    return <CaptionWord[]>JSON.parse(source);
  }

  throw "Cannot get video caption word-map for video with id: " + videoId;
}

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

export function getDocumentFact(
  factHash: string,
  callback: (
    error: string | Error | null,
    documentFact: Foundation.DocumentFactContent | null
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
        callback("Error retrieving Document Fact", null);
      }
    })
    .then(function(json: any) {
      callback(null, json);
    })
    .catch(function(error: Error) {
      // Network error
      callback(error, null);
    });
}

export function getDocumentFactTitle(excerptId: string): string {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.title;
    }
  }

  throw "Cannot get document title for document with id: " + excerptId;
}

export function getDocumentFactFilename(excerptId: string): string {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.filename;
    }
  }

  throw "Cannot get document filename for document with id: " + excerptId;
}

export function getDocumentFactPrimaryDate(excerptId: string): Date {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.primaryDate;
    }
  }

  throw "Cannot get document primary date for document with id: " + excerptId;
}

export function getDocumentFactPrimaryDateKind(excerptId: string): string {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.primaryDateKind;
    }
  }

  throw "Cannot get document primary date kind for document with id: " +
    excerptId;
}

export function getUser(username: string): User | null {
  for (let user of database.users) {
    if (user.name === username) {
      return user;
    }
  }

  throw "Cannot get user: " + username;
}

export function getAllUsers(): User[] {
  return database.users;
}

export function createUser(username: string): boolean {
  if (getUser(username)) {
    throw "User already exists with username: " + username;
  }

  return database.users.push({ name: username, articles: null }) > 0;
}

export function updateUserName(
  oldUserName: string,
  newUserName: string
): boolean {
  let oldUser = getUser(oldUserName);
  let newUser = getUser(newUserName);
  if (!oldUser || newUser) {
    throw "Failed to update username";
  }

  oldUser.name = newUserName;

  return true;
}

export function deleteUser(username: string): boolean {
  if (!getUser(username)) {
    throw "User doesn't exist: " + username;
  }

  let newDatabase: Database = {
    ...database,
    users: database.users.filter(user => {
      return user.name !== username;
    })
  };

  return true;
}

export function getAllArticles(username?: string): Article[] | null {
  if (username) {
    let user = getUser(username);
    if (user) {
      return user.articles;
    } else {
      return null;
    }
  }

  let articles: Article[] = [];
  for (let user of database.users) {
    if (user.articles) {
      articles = [...articles, ...user.articles];
    }
  }

  return articles;
}

export function getArticle(
  username: string,
  titleSlug: string
): Article | null {
  let user = getUser(username);
  if (user && user.articles) {
    for (let article of user.articles) {
      if (article.titleSlug === titleSlug) {
        return article;
      }
    }
  } else {
    //Invalid username
    throw "User doesn't exist: " + username;
  }

  //Article not found
  return null;
}

export function createArticle(
  username: string,
  title: string,
  blocks: TakeBlock[],
  previewBlocks: number[]
): boolean {
  if (!title) {
    // Throw error, title is required
    throw "Invalid title: " + title;
  }
  if (getArticle(username, slugify(title))) {
    // Can't create duplicate article
    throw "User, " + username + ", already has article with title, " + title;
    /**
		 * Could also create the article anyway and append an ID counter to the title,
		 * e.g. new-take-title, new-take-title-2, new-take-title-3
		 */
  }
  let user = getUser(username);
  if (user) {
    let articles = getAllArticles(username);
    if (articles) {
      articles = [
        ...articles,
        {
          title: title,
          titleSlug: slugify(title),
          blocks: blocks,
          previewBlocks: previewBlocks
        }
      ];
    } else {
      articles = [
        {
          title: title,
          titleSlug: slugify(title),
          blocks: blocks,
          previewBlocks: previewBlocks
        }
      ];
    }
    return true;
  } else {
    // Invalid username
    throw "User doesn't exist: " + username;
  }
}

export function updateArticleTitle(
  username: string,
  oldTitleSlug: string,
  newTitle: string
): boolean {
  let newArticle = getArticle(username, slugify(newTitle));
  if (newArticle) {
    // Can't create duplicate article
    throw "User, " + username + ", already has article with title, " + newTitle;
    /**
		 * Could also create the article anyway and append an ID counter to the title,
		 * e.g. new-take-title, new-take-title-2, new-take-title-3
		 */
  }

  let oldArticle = getArticle(username, oldTitleSlug);
  if (oldArticle) {
    oldArticle.title = newTitle;
    oldArticle.titleSlug = slugify(newTitle);

    return true;
  }

  throw "Failed to update article title";
}

export function updateArticle(
  username: string,
  titleSlug: string,
  newBlocks: TakeBlock[]
): boolean {
  let article = getArticle(username, titleSlug);
  if (article) {
    article.blocks = newBlocks;

    return true;
  }

  throw "Failed to update article";
}

export function deleteArticle(username: string, titleSlug: string): boolean {
  let user = getUser(username);
  if (user && user.articles) {
    let articles = user.articles.filter(article => {
      return article.titleSlug !== titleSlug;
    });
    let newUser: User = {
      ...user,
      articles: articles
    };
    let newDatabase: Database = {
      ...database,
      users: [...database.users, newUser]
    };
    return true;
  } else {
    // User or articles don't exist
    throw "Failed to delete article";
  }
}
