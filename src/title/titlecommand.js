import Command from '@ckeditor/ckeditor5-core/src/command';

export default class TitleCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;

		editor.model.change( writer => {

			const variableId = Math.floor( ( Math.random() * 1000 ) + 1 );

			// Create a <title> elment with it's attributes ....
			const title = writer.createElement( 'title', { 'data-id': variableId } );
			writer.appendText( '{' + value + '}', {}, title );

			// ... and insert it into the document.
			editor.model.insertContent( title );

			// Put the selection on the inserted element.
			writer.setSelection( title, 'on' );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'title' );

		this.isEnabled = isAllowed;
	}
}
