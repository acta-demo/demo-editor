import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import diffbyefficiencyIcon from './svg/not-equal-solid.svg';
import './css/diffbyefficiency.css';
const DIFFBYEFFICIENCY = 'diffbyefficiency';

export default class DiffByEfficiencyUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( DIFFBYEFFICIENCY, locale => {
			const view = new ButtonView( locale );
			view.class += ' efficiency';

			view.set( {
				label: t( 'Diff by letter' ),
				icon: diffbyefficiencyIcon,
				tooltip: true,
				isToggleable: true,
				withText: false
			} );


			this.listenTo( view, 'execute', () => {
				console.log( '#### DIFFBYEFFICIENCY clicked' );
				editor.set( 'diffbyefficiency', Date.now() );

			} );

			return view;
		} );
	}
}
