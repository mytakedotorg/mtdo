package buildsrc;

public class Env {
	/** https://devcenter.heroku.com/articles/buildpack-api#stacks */
	static final String ENV_VAR_HEROKU = "STACK";
	/** https://circleci.com/docs/1.0/environment-variables/#basics */
	static final String ENV_VAR_CI = "CI";
		/** https://circleci.com/docs/2.0/env-vars/#circleci-built-in-environment-variables */
	static final String ENV_VAR_CIRCLE_CI = "CIRCLECI";

	public static boolean isHerokuOrCI() {
		return isCI() || isHeroku();
	}

	public static boolean isCI() {
		return System.getenv().containsKey(ENV_VAR_CI);
	}

	public static boolean isHeroku() {
		return System.getenv().containsKey(ENV_VAR_HEROKU);
	}

	public static boolean isCircleCI() {
		return System.getenv().containsKey(ENV_VAR_CIRCLE_CI);
	}
}
