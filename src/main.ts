import { App, Editor, ItemView, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CanvasData } from "obsidian/canvas"

// Remember to rename these classes and interfaces!

interface CanvasGridSettings {
	onByDefault: boolean;
}

const DEFAULT_SETTINGS: CanvasGridSettings = {
	onByDefault: true
}

export default class CanvasGridPlugin extends Plugin {
	settings: CanvasGridSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new CanvasGridSettingsTab(this.app, this));

		this.app.workspace.onLayoutReady(() => this.tryReloadGridLines());
		this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.tryReloadGridLines()));
	}

	private tryReloadGridLines = () => this.ifActiveViewIsCanvas((canvas, data) => {
		const pattern = canvas.backgroundPatternEl as HTMLElement;

		pattern.querySelectorAll("rect").forEach(x => x.remove());


		// controls
		const controls: HTMLElement = canvas.canvasControlsEl;

		var subMenu = controls.children[1];

		subMenu.childNodes.forEach(node => {
			if ((node as any).canvasGridPlugin == true) node.remove();
		});

		if (!(canvas.config.showGridLines ?? this.settings.onByDefault)) {
			return;
		}


		let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("width", "40")
		rect.setAttribute("height", ".7");
		rect.setAttribute("y", ".5");
		rect.setAttribute("fill", "var(--canvas-dot-pattern)")
		rect.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		pattern.append(rect);

		rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("width", ".7");
		rect.setAttribute("height", "40");
		rect.setAttribute("y", ".5");
		rect.setAttribute("fill", "var(--canvas-dot-pattern)")
		rect.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		pattern.append(rect);
	});

	private ifActiveViewIsCanvas = (fn: (canvas: any, canvasData: CanvasData) => void) => {
		const canvasView = this.app.workspace.getActiveViewOfType(ItemView);

		if (canvasView?.getViewType() !== 'canvas') {
			return;
		}

		const canvas = (canvasView as any).canvas;

		if (!canvas) return;

		const canvasData = canvas.getData() as CanvasData;

		if (!canvasData) return;

		return fn(canvas, canvasData);
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CanvasGridSettingsTab extends PluginSettingTab {
	plugin: CanvasGridPlugin;

	constructor(app: App, plugin: CanvasGridPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable Grid by Default')
			.setDesc('Whether to enable canvas grids by default for every canvas')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.onByDefault)
					.onChange(async val => {
						this.plugin.settings.onByDefault = val;
						await this.plugin.saveSettings();
					})
			);

		// .addText(text => text
		// 	.setPlaceholder('Enter your secret')
		// 	.setValue(this.plugin.settings.mySetting)
		// 	.onChange(async (value) => {
		// 		this.plugin.settings.mySetting = value;
		// 		await this.plugin.saveSettings();
		// 	}));
	}
}
