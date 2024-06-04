package buildsrc;
public class Env {
	/** https://devcenter.heroku.com/articles/buildpack-api#stacks */
	static final String ENV_VAR_HEROKU = "STACK";
	static final String ENV_VAR_CI = "CI";
	static final String ENV_VAR_GITHUB_CI = "GITHUB_ACTION";

	public static boolean isHerokuOrCI() {
		return isCI() || isHeroku();
	}

	public static boolean isCI() {
		return System.getenv().containsKey(ENV_VAR_CI);
	}

	public static boolean isHeroku() {
		return System.getenv().containsKey(ENV_VAR_HEROKU);
	}

	public static boolean isHerokuPR() {
		return isHeroku() && System.getenv().containsKey("HEROKU_PR_NUMBER");
	}

	public static boolean isGithubCI() {
		return System.getenv().containsKey(ENV_VAR_GITHUB_CI);
	}
}
