import java.io.File;

import org.gradle.api.Project;

import com.moowork.gradle.node.NodeExtension;
import com.moowork.gradle.node.variant.VariantBuilder;

public class MooworkNode {
	public static File nodeModules(Project project) {
		return project.file("node_modules");
	}

	public static File nodeExe(Project project) {
		return new File(new VariantBuilder(NodeExtension.get(project)).build().getNodeBinDir(), "node");
	}
}
