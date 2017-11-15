/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import com.diffplug.common.base.Errors;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** An immutable map from {@link MetaField} to values. Does not allow nulls. */
public class MetaMap {
	private ImmutableMap<MetaField<?>, Object> map;

	private MetaMap(Map<MetaField<?>, Object> map) {
		this.map = ImmutableMap.copyOf(map);
	}

	/** Returns the vars which this MetaMap contains. */
	public ImmutableSet<MetaField<?>> keySet() {
		return map.keySet();
	}

	/** Returns the value of the given var, throws an Exception if it doesn't exist. */
	public <T> T get(MetaField<T> var) {
		@SuppressWarnings("unchecked")
		T value = (T) map.get(var);
		Preconditions.checkNotNull(value);
		return value;
	}

	@Override
	public String toString() {
		return map.toString();
	}

	/** Returns an empty MetaMap. */
	public static MetaMap of() {
		return new MetaMap(ImmutableMap.of());
	}

	/** Returns a MetaMap containing the given mapping. */
	public static <T> MetaMap of(MetaField<T> var, T value) {
		return new MetaMap(ImmutableMap.of(var, value));
	}

	/** Returns a MetaMap containing the given mappings. */
	public static <T, U> MetaMap of(MetaField<T> tVar, T tVal, MetaField<U> uVar, U uVal) {
		return new MetaMap(ImmutableMap.of(tVar, tVal, uVar, uVal));
	}

	/** Returns a MetaMap containing the given mappings. */
	public static <T, U, V> MetaMap of(MetaField<T> tVar, T tVal, MetaField<U> uVar, U uVal, MetaField<V> vVar, V vVal) {
		return new MetaMap(ImmutableMap.of(tVar, tVal, uVar, uVal, vVar, vVal));
	}

	/** Returns a MetaMap containing the given mappings. */
	public static <T, U, V, W> MetaMap of(MetaField<T> tVar, T tVal, MetaField<U> uVar, U uVal, MetaField<V> vVar, V vVal, MetaField<W> wVar, W wVal) {
		return new MetaMap(ImmutableMap.of(tVar, tVal, uVar, uVal, vVar, vVal, wVar, wVal));
	}

	/** Returns a MetaMap containing the given mappings. */
	public static <T, U, V, W, X> MetaMap of(MetaField<T> tVar, T tVal, MetaField<U> uVar, U uVal, MetaField<V> vVar, V vVal, MetaField<W> wVar, W wVal, MetaField<X> xVar, X xVal) {
		return new MetaMap(ImmutableMap.of(tVar, tVal, uVar, uVal, vVar, vVal, wVar, wVal, xVar, xVal));
	}

	/** Returns a builder for creating ImmutableVarMaps. */
	public static Builder builder() {
		return new Builder(Collections.emptyMap());
	}

	/** Returns a builder for creating ImmutableVarMaps. */
	public static Builder builderFromCopy(MetaMap initial) {
		return new Builder(initial.map);
	}

	/** Class which builds ImmutableVarMaps. */
	public static class Builder {
		private Map<MetaField<?>, Object> map;

		private Builder(Map<MetaField<?>, Object> initial) {
			map = new HashMap<>(initial);
		}

		/** Sets the given var in the variable map. Duplicates and nulls are not allowed. */
		public <T> void init(MetaField<? extends T> var, T value) {
			Object oldValue = set(var, value);
			if (oldValue != null) {
				throw new IllegalArgumentException("Duplicate value for field " + var + ": old=" + oldValue + " new=" + value);
			}
		}

		/** Sets the given var in the variable map. Returns the previous value, if any. */
		@SuppressWarnings("unchecked")
		public <T> T set(MetaField<? extends T> var, T value) {
			Preconditions.checkNotNull(value, "%s unexpectedly null", var);
			return (T) map.put(var, value);
		}

		/** Builds an ImmutableVarMap from this builder. The builder can continue to be used if you would like. */
		public MetaMap build() {
			return new MetaMap(map);
		}
	}

	////////////////////////////////////////
	// Interact with POJOs via reflection //
	////////////////////////////////////////
	static String cap(String input) {
		return input.substring(0, 1).toUpperCase(Locale.ROOT) + input.substring(1);
	}

	public static MetaMap buildFrom(Object value, Class<? extends MetaFormDef> formDefClazz) {
		return buildFrom(value, MetaFormDef.create(formDefClazz));
	}

	public static MetaMap buildFrom(Object value, MetaFormDef formDef) {
		return buildFrom(value, formDef.fields());
	}

	public static MetaMap buildFrom(Object value, Iterable<MetaField<?>> fields) {
		try {
			MetaMap.Builder builder = MetaMap.builder();
			Class<?> clazz = value.getClass();
			for (MetaField<?> field : fields) {
				Method method = clazz.getMethod("get" + cap(field.name()));
				Object getterValue = method.invoke(value);
				if (getterValue != null) {
					builder.init(field, getterValue);
				}
			}
			return builder.build();
		} catch (Exception e) {
			throw Errors.asRuntime(e);
		}
	}

	/** Creates an instance of class, then calls {@link #setSettersOf(Object)}. */
	public <T> T into(Class<T> clazz) {
		try {
			T value = clazz.newInstance();
			setFields(clazz, value);
			return value;
		} catch (Exception e) {
			throw Errors.asRuntime(e);
		}
	}

	public void setSettersOf(Object value) {
		try {
			Class<?> clazz = value.getClass();
			setFields(clazz, value);
		} catch (Exception e) {
			throw Errors.asRuntime(e);
		}
	}

	private void setFields(Class<?> clazz, Object value) throws Exception {
		for (MetaField<?> field : map.keySet()) {
			Method method = clazz.getMethod("set" + cap(field.name()), field.clazz());
			method.invoke(value, map.get(field));
		}
	}
}
