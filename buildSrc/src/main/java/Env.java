import java.util.Set;

public class Env {
	public static boolean isHerokuOrCI() {
		String HEROKU_ENV_VAR = "STACK";  // https://devcenter.heroku.com/articles/buildpack-api#stacks
		String CI_ENV_VAR = "CI";  // https://circleci.com/docs/1.0/environment-variables/#basics
		Set<String> env = System.getenv().keySet();
		return env.contains(HEROKU_ENV_VAR) || env.contains(CI_ENV_VAR);
	}
}
