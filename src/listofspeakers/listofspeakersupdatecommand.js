import Command from '@ckeditor/ckeditor5-core/src/command';
import ListOfSpeakersEditing from './listofspeakersediting';
import Util from '../utils/Util';

export default class ListOfSpeakersUpdateCommand extends Command {
	execute( { value, currentValue, dataJson } ) {
		console.log( '#### ListOfSpeakersUpdateCommand value:', value );
		const editor = this.editor;
		const modelElement = editor.model.document.selection.getSelectedElement()
			? editor.model.document.selection.getSelectedElement()
			: Util.selectedElement;

		editor.model.change( writer => {
			if ( modelElement.hasAttribute( 'data-suggestion-new-value' ) ) {
				writer.removeAttribute( 'data-suggestion-new-value', modelElement );
			}
			writer.setAttribute(
				'data-content',
				value,
				modelElement
			);
			writer.setAttribute(
				'data-json',
				dataJson,
				modelElement
			);

			// Put the selection on the inserted element.
			writer.setSelection( modelElement, 'on' );

		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'lsp' );

		this.isEnabled = isAllowed;
	}
}
