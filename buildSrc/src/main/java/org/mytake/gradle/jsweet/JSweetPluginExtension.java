/* 
 * Copyright (C) 2015 Louis Grignon <louis.grignon@gmail.com>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.mytake.gradle.jsweet;

import java.io.File;

import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.OutputDirectory;
import org.jsweet.transpiler.EcmaScriptComplianceLevel;
import org.jsweet.transpiler.ModuleKind;

/**
 * Plugin's configuration
 * 
 * @author Louis Grignon
 *
 */
public class JSweetPluginExtension {
	@Input
	public EcmaScriptComplianceLevel getTargetVersion() {
		return targetVersion;
	}

	public void setTargetVersion(EcmaScriptComplianceLevel targetVersion) {
		this.targetVersion = targetVersion;
	}

	@Input
	public ModuleKind getModule() {
		return module;
	}

	public void setModule(ModuleKind module) {
		this.module = module;
	}

	@OutputDirectory
	public File getTsOut() {
		return tsOut;
	}

	public void setTsOut(File tsOut) {
		this.tsOut = tsOut;
	}

	@Input
	public Boolean isTsOnly() {
		return tsOnly;
	}

	public void setTsOnly(Boolean tsOnly) {
		this.tsOnly = tsOnly;
	}

	@Input
	public String[] getIncludes() {
		return includes;
	}

	public void setIncludes(String[] includes) {
		this.includes = includes;
	}

	@Input
	public String getFactoryClassName() {
		return factoryClassName;
	}

	public void setFactoryClassName(String factoryClassName) {
		this.factoryClassName = factoryClassName;
	}

	private EcmaScriptComplianceLevel targetVersion = EcmaScriptComplianceLevel.ES3;
	private ModuleKind module = ModuleKind.none;
	private File tsOut;
	private Boolean tsOnly = false;
	private String[] includes = null;

	private String factoryClassName;


	protected Boolean ignoreTypeScriptErrors;
	protected File header;

	protected File workingDir;
	
}
