/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
import { getFullURLPath } from "./browser";
import { Routes } from "./java2ts/Routes";
export async function post<T, R>(path: string, body: T): Promise<R> {
  const response = await fetchWithJson({
    path: path,
    body: body,
    method: "POST",
  });
  return response.json();
}

export async function get<T>(
  path: string,
  cache: RequestCache = "default"
): Promise<T> {
  const response = await fetch(
    new Request(path, {
      method: "GET",
      cache: cache,
      credentials: "omit",
    })
  );
  return response.json();
}

export async function put<T>(path: string, body: T): Promise<Date> {
  const response = await fetchWithJson({
    path: path,
    body: body,
    method: "PUT",
  });
  return new Date(response.headers.get("Last-Modified")!);
}

export async function deleteReq<T>(path: string, body: T): Promise<Response> {
  return await fetchWithJson({ path: path, body: body, method: "DELETE" });
}

interface FetchArgs<T> {
  path: string;
  body: T;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

async function fetchWithJson<T>(args: FetchArgs<T>): Promise<Response> {
  const response = await fetch(
    new Request(args.path, {
      method: args.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args.body),
    })
  );
  if (response.status === 403) {
    if (response.headers.get("Refresh-Might-Fix") === "true") {
      window.location.href = `${Routes.LOGIN}?redirect=${encodeURI(
        getFullURLPath()
      )}`;
    } else {
      throw new LoginError(await response.text());
    }
  }
  return response;
}

// https://stackoverflow.com/a/5251506
interface LoginError {
  name: string;
  message: string;
  stack?: string;
}
export const LoginError = (function (message: string) {
  this.name = "LoginError";
  this.message = message;
  this.stack = new Error().stack;
} as any) as { new (message: string): LoginError };
