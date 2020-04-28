import Command from '@ckeditor/ckeditor5-core/src/command';
import VariableEditing from './variableediting';

export default class VariableCommand extends Command {
	execute({ value }) {
		console.log('#### VariableCommand value:', value);
		const editor = this.editor;

		editor.model.change(writer => {
			// Create a <variable> elment with the "name" attribute...
			//const variable = writer.createElement('var', { name: value });
			const variableId = Math.floor((Math.random() * 1000) + 1);
			const variable = writer.createElement('variable', {
				'data-id': variableId,
				'data-content': 'UNRESOLVED',
				'data-viewmode': VariableEditing.viewmode,
				'data-type': value
			});

			// ... and insert it into the document.
			editor.model.insertContent(variable);

			// Put the selection on the inserted element.
			writer.setSelection(variable, 'on');

		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild(selection.focus.parent, 'variable');

		this.isEnabled = isAllowed;
	}
}