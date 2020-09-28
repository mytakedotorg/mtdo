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
package controllers;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

/**
 * If you checkout a fact repository as a peer to this, and add a "mtdo-" prefix to the folder name,
 * then this class will use that local git repository to serve the facts, rather than GitHub.
 */
public class FactApiDev extends FactApi {
	private Set<String> localRepos = new HashSet<>();

	public FactApiDev() {
		for (String repo : ALLOWED_FACTSETS.values()) {
			if (localRepo(repo).exists()) {
				localRepos.add(repo);
			}
		}
	}

	private File localRepo(String repo) {
		return new File("../../mtdo-" + repo + "/.git");
	}

	@Override
	protected byte[] repoSha(String repo, String sha) throws IOException {
		if (localRepos.contains(repo)) {
			try (Repository repository = new FileRepositoryBuilder().setGitDir(localRepo(repo)).build()) {
				return repository.open(ObjectId.fromString(sha), Constants.OBJ_BLOB).getBytes();
			} catch (IOException e) {
				System.err.println("Maybe pull latest commits for " + localRepo(repo).getAbsolutePath());
				throw e;
			}
		} else {
			return super.repoSha(repo, sha);
		}
	}
}
