import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import diffbywordIcon from './svg/diffbyword.svg';

const DIFFBYWORD = 'diffbyword';

export default class DiffByWordUI extends Plugin {

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( DIFFBYWORD, locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Diff by word' ),
				icon: diffbywordIcon,
				tooltip: true,
				isToggleable: true,
				withText: false
			} );

			this.listenTo( view, 'execute', () => {
				console.log( '#### DIFFBYWORD clicked' );
				editor.set( 'diffbyword', Date.now() );
			} );

			return view;
		} );
	}
}
