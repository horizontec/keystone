/**
TODO:
- Format size of stored file (if present) using bytes package?
- Display file type icon? (see LocalFileField)
*/

import Field from '../Field'
import React, { PropTypes } from 'react'
import Field from '../Field';
import React, { PropTypes } from 'react';
import xhr from 'xhr';

import {
	Button,
	FormField,
	FormInput,
	FormNote
} from '../../../admin/client/App/elemental'
import FileChangeMessage from '../../components/FileChangeMessage'
import HiddenFileInput from '../../components/HiddenFileInput'
import ImageThumbnail from '../../components/ImageThumbnail'
import Gallery from '../../components/Gallery'

let uploadInc = 1000
const customStyles = {
  content: {
    top: '10%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '900px',
    height: '600px',
    // overflowX: 'hidden',
    transform: 'translate(-50%, 0)',
    padding: '0',
    border: '0',
    marginBottom: '100px',
    boxShadow: '6px 2px 13px 0 rgba(139, 141, 146, 0.2)'
  },
  overlay: {
    backgroundColor: 'rgba(27, 36, 62, 0.8)',
    overflowY: 'scroll',
    // overflowX: 'hidden',
    zIndex: '2'
  }
}


const buildInitialState = props => ({
	action: null,
	removeExisting: false,
	uploadFieldPath: `File-${props.path}-${++uploadInc}`,
	userSelectedFile: null,
	modalIsOpen: false,
	photoUrl:[]
})

module.exports = Field.create({
	propTypes: {
		autoCleanup: PropTypes.bool,
		collapse: PropTypes.bool,
		label: PropTypes.string,
		note: PropTypes.string,
		path: PropTypes.string.isRequired,
		thumb: PropTypes.bool,
		value: PropTypes.shape({
			filename: PropTypes.string
			// TODO: these are present but not used in the UI,
			//       should we start using them?
			// filetype: PropTypes.string,
			// originalname: PropTypes.string,
			// path: PropTypes.string,
			// size: PropTypes.number,
		})
	},
	statics: {
		type: 'ImageUploader',
		getDefaultValue: () => ({})
	},
	getInitialState() {
		return buildInitialState(this.props)
	},
	componentDidMount(){
	  this.closeModal = this.closeModal.bind(this);
		this.openModal = this.openModal.bind(this);
		this.loadPhoto();
	},
	shouldCollapse() {
		return this.props.collapse && !this.hasExisting()
	},
	componentWillUpdate(nextProps) {
		// Show the new filename when it's finished uploading
		if (this.props.value.filename !== nextProps.value.filename) {
			this.setState(buildInitialState(nextProps))
		}
	},

	// ==============================
	// HELPERS
	// ==============================

	hasFile() {
		return this.hasExisting() || !!this.state.userSelectedFile
	},
	hasExisting() {
		return this.props.value && !!this.props.value.filename
	},
	getFilename() {
		return this.state.userSelectedFile
			? this.state.userSelectedFile.name
			: this.props.value.filename
	},
	getFileUrl() {
		return this.props.value && this.props.value.url
	},
	isImage() {
		const { mimetype } = this.props.value
		const href = this.props.value ? this.props.value.url : undefined
		const hasImageMime = mimetype && mimetype.includes('image')

		return (
			(href && href.match(/\.(jpeg|jpg|gif|png|svg)$/i) != null) || hasImageMime
		)
	},

	getImageUrl() {
		const { filename, mimetype } = this.props.value
		console.log('filename', filename)
		return `/uploads/${filename}`
	},

	// ==============================
	// METHODS
	// ==============================

	triggerFileBrowser() {
		this.refs.fileInput.clickDomNode()
	},
	handleFileChange(event) {
		const userSelectedFile = event.target.files[0]
		console.log('change',event.target.files[0])
		this.setState({
			userSelectedFile: userSelectedFile,
			eventFiles: event.target.files
		})
	},
	handleRemove(e) {
		var state = {}

		if (this.state.userSelectedFile) {
			state = buildInitialState(this.props)
		} else if (this.hasExisting()) {
			state.removeExisting = true

			if (this.props.autoCleanup) {
				if (e.altKey) {
					state.action = 'reset'
				} else {
					state.action = 'delete'
				}
			} else {
				if (e.altKey) {
					state.action = 'delete'
				} else {
					state.action = 'reset'
				}
			}
		}

		this.setState(state)
	},
	undoRemove() {
		this.setState(buildInitialState(this.props))
	},

	// ==============================
	// RENDERERS
	// ==============================

	renderFileNameAndChangeMessage() {
		const href = this.props.value ? this.props.value.url : undefined
		return (
			<div>
				{this.hasFile() && !this.state.removeExisting ? (
					<FileChangeMessage
						component={href ? 'a' : 'span'}
						href={href}
						target="_blank"
					>
						{this.getFilename()}
					</FileChangeMessage>
				) : null}
				{this.renderChangeMessage()}
			</div>
		)
	},
	renderChangeMessage() {
		if (this.state.userSelectedFile) {
			return (
				<FileChangeMessage color="success">Save to Upload</FileChangeMessage>
			)
		} else if (this.state.removeExisting) {
			return (
				<FileChangeMessage color="danger">
					File {this.props.autoCleanup ? 'deleted' : 'removed'} - save to
					confirm
				</FileChangeMessage>
			)
		} else {
			return null
		}
	},
	renderClearButton() {
		if (this.state.removeExisting) {
			return (
				<Button variant="link" onClick={this.undoRemove}>
					Undo Remove
				</Button>
			)
		} else {
			var clearText
			if (this.state.userSelectedFile) {
				clearText = 'Cancel Upload'
			} else {
				clearText = this.props.autoCleanup ? 'Delete File' : 'Remove File'
			}
			return (
				<Button variant="link" color="cancel" onClick={this.handleRemove}>
					{clearText}
				</Button>
			)
		}
	},
	renderActionInput() {
		// If the user has selected a file for uploading, we need to point at
		// the upload field. If the file is being deleted, we submit that.
		if (this.state.userSelectedFile || this.state.action) {
			const value = this.state.userSelectedFile
				? `upload:${this.state.uploadFieldPath}`
				: this.state.action === 'delete'
				? 'remove'
				: ''
			return (
				<input
					name={this.getInputName(this.props.path)}
					type="hidden"
					value={value}
				/>
			)
		} else {
			return null
		}
	},
	renderImagePreview() {
		const imageSource = this.getImageUrl()
		//console.warn({ imageSource })
		return (
			<ImageThumbnail
				component="a"
				href={imageSource}
				target="__blank"
				style={{ float: 'left', marginRight: '1em', maxWidth: '50%' }}
			>
				<img
					src={imageSource}
					style={{ 'max-height': 100, 'max-width': '100%' }}
				/>
			</ImageThumbnail>
		)
	},
	loadPhoto() {
		xhr({
			url: Keystone.adminPath + '/api/' + 'locals',
			responseType: 'json',
		},(err, resp, data) => {
			console.log('here', data);
		});
	},
	closeModal (e) {
		e.preventDefault()
    this.setState({ modalIsOpen: false })
  },

  openModal(){
    this.setState({ modalIsOpen: true })
  },
	renderUI() {
		const { label, note, path, thumb } = this.props
		const isImage = this.isImage()
		const hasFile = this.hasFile()
		// console.table(this.props)
		//console.warn({ isImage, hasFile, thumb })
		const previews = (
			<div style={isImage ? { marginBottom: '1em' } : null}>
				{isImage && this.renderImagePreview()}
				{hasFile && this.renderFileNameAndChangeMessage()}
			</div>
		)

		const buttons = (
			<div style={hasFile ? { marginTop: '1em' } : null}>
				<Button onClick={this.triggerFileBrowser}>
					{hasFile ? 'Change' : 'Upload'} File
				</Button>
				{hasFile && this.renderClearButton()}
			</div>
		)
		const openModalButton = (
			<div style={hasFile ? { marginTop: '1em' } : null}>
				<Button onClick={this.openModal}>
					openModal
				</Button>
			</div>
		)

		const {modalIsOpen} =this.state
		console.log('modal', modalIsOpen)
		const modalWindow = (
			<div style={{position:"fixed", top:0,left:0, width:window.innerWidth, height:'100vh',
			 backgroundColor:'rgba(0,0,0,0.7)', zIndex:6666, visibility: modalIsOpen? 'visible': 'hidden'}}>
				<Gallery
					key={this.state.uploadFieldPath}
					name={this.state.uploadFieldPath}
					onChange={this.handleFileChange}
					hasFile={hasFile}
					triggerFileBrowser={this.triggerFileBrowser}
					renderClearButton={this.renderClearButton}
					closeModal={this.closeModal}
				/>
				{modalIsOpen && previews}
			</div>
		)
		return (
			 <div data-field-name={path} data-field-type="file">
				<FormField label={label} htmlFor={path}>
					{this.shouldRenderField() ? (
						<div>
							{previews}
							{openModalButton}
							{modalWindow}
							{this.renderActionInput()}
						</div>
					) : (
						<div>
							{hasFile ? (
								this.renderFileNameAndChangeMessage()
							) : (
								<FormInput noedit>no file</FormInput>
							)}
						</div>
					)}
					{!!note && <FormNote html={note} />}
				</FormField>
			</div>
		)
	}
})
