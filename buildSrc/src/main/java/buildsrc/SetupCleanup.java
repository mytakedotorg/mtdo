package buildsrc;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.nio.file.Files;
import java.util.Arrays;

import com.diffplug.common.base.Errors;

public abstract class SetupCleanup<K> {
	public void start(File keyFile, K key) throws Exception {
		byte[] required = toBytes(key);
		if (keyFile.exists()) {
			byte[] actual = Files.readAllBytes(keyFile.toPath());
			if (Arrays.equals(actual, required)) {
				// short-circuit if our state is already setup
				return;
			} else {
				Files.delete(keyFile.toPath());
				@SuppressWarnings("unchecked")
				K lastKey = (K) fromBytes(required);
				doStop(lastKey);
			}
		}
		// write out the key
		doStart(key);
		Files.createDirectories(keyFile.toPath().getParent());
		Files.write(keyFile.toPath(), required);
	}

	public void forceStop(File keyFile, K key) throws Exception {
		doStop(key);
		Files.delete(keyFile.toPath());
	}

	protected abstract void doStart(K key) throws Exception;

	protected abstract void doStop(K key) throws Exception;

	private static byte[] toBytes(Object key) {
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		try (ObjectOutputStream objectOutput = new ObjectOutputStream(bytes)) {
			objectOutput.writeObject(key);
		} catch (IOException e) {
			throw Errors.asRuntime(e);
		}
		return bytes.toByteArray();
	}

	private static Object fromBytes(byte[] raw) throws ClassNotFoundException {
		ByteArrayInputStream bytes = new ByteArrayInputStream(raw);
		try (ObjectInputStream objectOutput = new ObjectInputStream(bytes)) {
			return objectOutput.readObject();
		} catch (IOException e) {
			throw Errors.asRuntime(e);
		}
	}
}
