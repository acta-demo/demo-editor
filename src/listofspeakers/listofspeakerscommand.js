import Command from '@ckeditor/ckeditor5-core/src/command';
import ListOfSpeakersEditing from './listofspeakersediting';

export default class ListOfSpeakersCommand extends Command {
	execute({ value }) {
		console.log('#### ListOfSpeakersCommand value:', value);
		const editor = this.editor;

		editor.model.change(writer => {
			// Create a <lsp> elment with the "name" attribute...
			//const lsp = writer.createElement('lsp', { name: value });
			const variableId = Math.floor((Math.random() * 1000) + 1);
			const lsp = writer.createElement('lsp', {
				'data-id': variableId,
				'data-content': 'UNRESOLVED',
				'data-viewmode': ListOfSpeakersEditing.viewmode,
				'data-type': value
			});

			// ... and insert it into the document.
			editor.model.insertContent(lsp);

			// Put the selection on the inserted element.
			writer.setSelection(lsp, 'on');

		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild(selection.focus.parent, 'lsp');

		this.isEnabled = isAllowed;
	}
}