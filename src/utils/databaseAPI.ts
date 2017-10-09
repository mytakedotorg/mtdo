import database, {
  Database,
  VideoFact,
  DocumentFact,
  User,
  Article
} from "./databaseData";
import { slugify } from "./functions";
import { TakeBlock } from "../components/BlockEditor";

export function getAllVideoFacts(): VideoFact[] {
  return database.videos;
}

export function getVideoFact(videoId: string): VideoFact | null {
  for (let video of database.videos) {
    if (video.id === videoId) {
      return video;
    }
  }

  return null;
}

export function getVideoFactTitle(videoId: string): string | null {
  let video = getVideoFact(videoId);
  if (video) {
    return video.title;
  }

  return null;
}

export function getVideoFactPrimaryDate(videoId: string): Date | null {
  let video = getVideoFact(videoId);
  if (video) {
    return video.primaryDate;
  }

  return null;
}

export function getVideoFactPrimaryDateKind(videoId: string): string | null {
  let video = getVideoFact(videoId);
  if (video) {
    return video.primaryDateKind;
  }

  return null;
}

export function getVideoFactCaptionFile(videoId: string): string | null {
  let video = getVideoFact(videoId);
  if (video && video.captionFile) {
    return video.captionFile;
  }

  return null;
}

export function getAllDocumentFacts(): DocumentFact[] {
  return database.excerpts;
}

export function getDocumentFact(excerptId: string): DocumentFact | null {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt;
    }
  }

  return null;
}

export function getDocumentFactTitle(excerptId: string): string | null {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.title;
    }
  }

  return null;
}

export function getDocumentFactFilename(excerptId: string): string | null {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.filename;
    }
  }

  return null;
}

export function getDocumentFactPrimaryDate(excerptId: string): Date | null {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.primaryDate;
    }
  }

  return null;
}

export function getDocumentFactPrimaryDateKind(
  excerptId: string
): string | null {
  for (let excerpt of database.excerpts) {
    if (slugify(excerpt.title) === excerptId) {
      return excerpt.primaryDateKind;
    }
  }

  return null;
}

export function getUser(username: string): User | null {
  for (let user of database.users) {
    if (user.name === username) {
      return user;
    }
  }

  return null;
}

export function getAllUsers(): User[] {
  return database.users;
}

export function createUser(username: string): boolean {
  if (getUser(username)) {
    return false;
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
    return false;
  }

  oldUser.name = newUserName;

  return true;
}

export function deleteUser(username: string): boolean {
  if (!getUser(username)) {
    // User doesn't exist
    return false;
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
    return null;
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
    return false;
  }
  if (getArticle(username, slugify(title))) {
    // Can't create duplicate article
    return false;
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
    return false;
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
    return false;
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

  return false;
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

  return false;
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
    return false;
  }
}
