import Command from '@ckeditor/ckeditor5-core/src/command';
import VariableEditing from './variableediting';

export default class VariableUpdateCommand extends Command {
	execute( { value } ) {
		console.log( '#### VariableUpdateCommand value:', value );
		const editor = this.editor;
		const modelElement = editor.model.document.selection.getSelectedElement();
		editor.model.change( writer => {
			writer.setAttribute(
				'data-content',
				value,
				modelElement
			);

			// Put the selection on the inserted element.
			writer.setSelection( modelElement, 'on' );

		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'variable' );

		this.isEnabled = isAllowed;
	}
}
