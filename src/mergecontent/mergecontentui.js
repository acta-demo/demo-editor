import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import mergeIcon from './svg/object-group-regular.svg';

const MERGE = 'merge';

export default class MergeContentUI extends Plugin {

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( MERGE, locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Merge' ),
				icon: mergeIcon,
				tooltip: true,
				isToggleable: true,
				withText: false
			} );

			this.listenTo( view, 'execute', () => {
				console.log( '#### MERGE clicked' );
				editor.set( 'merge', Date.now() );
			} );

			return view;
		} );
	}
}
