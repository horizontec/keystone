import { PANE_SIZE } from './SortablePane';

const addButtonStyle = {
	borderRadius: 5,
	opacity: 1,
	border: '3px dashed #ccc',
	backgroundColor: 'rgb(245,245,245)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	width: PANE_SIZE,
	height: PANE_SIZE,
	marginLeft: 20,
	fontSize: 50,
	color: '#1385e5',
};

const modalStyles = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: '100vw',
	height: '100vh',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: 'rgba(0,0,0,0.6)',
	zIndex: 5005005050505,
};

const relationshipListButton = {
	border: '3px dashed #ccc',
	backgroundColor: 'rgb(245,245,245)',
	padding: '1.5rem',
	borderRadius: 5,
	margin: '1rem',
};

const closeModalButton = {
	position: 'absolute',
	top: -10,
	right: -10,
	borderRadius: '50%',
	border: 'none',
	width: 20,
	height: 20,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: '#ff6666',
	outline: 'none',
};

const closeModalButtonText = {
	width: '100%',
	height: '100%',
	transform: 'rotate(45deg)',
	color: '#fff',
	fontSize: 20,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

module.exports = {
	modalStyles,
	addButtonStyle,
	relationshipListButton,
	closeModalButton,
	closeModalButtonText,
};
