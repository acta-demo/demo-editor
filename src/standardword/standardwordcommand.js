import Command from '@ckeditor/ckeditor5-core/src/command';

export default class StandardWordCommand extends Command {
	execute({ value }) {
		const editor = this.editor;

		editor.model.change(writer => {

			const variableId = Math.floor((Math.random() * 1000) + 1);

			// Create a <stw> elment with it's attributes ....
			const stw = writer.createElement('stw', { 'data-id': variableId });
			writer.appendText('{' + value + '}', {}, stw);

			// ... and insert it into the document.
			editor.model.insertContent(stw);

			// Put the selection on the inserted element.
			writer.setSelection(stw, 'on');
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild(selection.focus.parent, 'stw');

		this.isEnabled = isAllowed;
	}
}