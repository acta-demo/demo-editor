import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';


export default class VariableUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const variableNames = editor.config.get('variableConfig.types');

		// The "variable" dropdown must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add('variable', locale => {
			const dropdownView = createDropdown(locale);

			// Populate the list in the dropdown with items.
			addListToDropdown(dropdownView, getDropdownItemsDefinitions(variableNames));

			dropdownView.buttonView.set({
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t('Variable'),
				tooltip: true,
				withText: true
			});

			// Disable the variable button when the command is disabled.
			const command = editor.commands.get('variable');
			dropdownView.bind('isEnabled').to(command);

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo(dropdownView, 'execute', evt => {
				editor.execute('variable', { value: evt.source.commandParam });
				editor.editing.view.focus();
			});

			return dropdownView;
		});
	}
}

function getDropdownItemsDefinitions(variableNames) {
	const itemDefinitions = new Collection();

	for (const vname of variableNames) {
		const definition = {
			type: 'button',
			model: new Model({
				commandParam: vname.type,
				label: vname.title,
				withText: true
			})
		};

		// Add the item definition to the collection.
		itemDefinitions.add(definition);
	}

	return itemDefinitions;
}