import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';


export default class MouseRightClickObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = 'mousedown ';
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}