import React, { Component } from 'react'
import HiddenFileInput from './HiddenFileInput'
import { Button } from '../../admin/client/App/elemental'

class Gallery extends Component {
  constructor(props){
    super(props)
    this.triggerFileBrowser= this.triggerFileBrowser.bind(this)
  }
  triggerFileBrowser() {
		this.refs.fileInput.clickDomNode()
	}
  render() {
    const buttons = (
			<div style={this.props.hasFile ? { marginTop: '1em' } : null}>
				<Button onClick={this.triggerFileBrowser}>
					{this.props.hasFile ? 'Change' : 'Upload'} File
				</Button>
				{this.props.hasFile && this.props.renderClearButton()}
			</div>
    )
    return (
      <div>
        <button onClick={this.props.closeModal}>X</button>
        {buttons}
        <HiddenFileInput
					key={this.props.key}
					name={this.props.name}
					onChange={this.props.onChange}
          ref="fileInput"
          className={'Gallery'}
				/>
      </div>
    )
  }
}

export default Gallery
