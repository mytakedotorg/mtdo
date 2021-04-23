package buildsrc;

import java.io.File;
import java.io.IOException;

import org.assertj.core.api.Assertions;

public class NvmRcTest {
	//@Test
	public void testRead() throws IOException {
		Assertions.assertThat(NvmRc.read(new File("../.nvmrc"))).isEqualTo("v12.18.4");
	}
}
