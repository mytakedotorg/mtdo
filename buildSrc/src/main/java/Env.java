public class Env {
	/** https://devcenter.heroku.com/articles/buildpack-api#stacks */
	static final String ENV_VAR_HEROKU = "STACK";
	/** https://circleci.com/docs/1.0/environment-variables/#basics */
	static final String ENV_VAR_CI = "CI";
	
	public static boolean isHerokuOrCI() {
		return isCI() || isHeroku();
	}

	public static boolean isCI() {
		return System.getenv().containsKey(ENV_VAR_CI);
	}

	public static boolean isHeroku() {
		return System.getenv().containsKey(ENV_VAR_HEROKU);
	}
}
