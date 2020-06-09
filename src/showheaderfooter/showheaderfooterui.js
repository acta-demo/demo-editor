import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import showheaderfooterIcon from './svg/headerfooter.svg';

const SHOWHEADERFOOTER = 'showheaderfooter';

export default class ShowHeaderFooterUI extends Plugin {

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( SHOWHEADERFOOTER, locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Show header/footer' ),
				icon: showheaderfooterIcon,
				tooltip: true,
				isToggleable: true,
				withText: false
			} );

			this.listenTo( view, 'execute', () => {
				console.log( '#### SHOWHEADERFOOTER clicked' );
				editor.set( SHOWHEADERFOOTER, Date.now() );
			} );

			return view;
		} );
	}
}
