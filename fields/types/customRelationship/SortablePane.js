import React, { Component, PropTypes } from 'react';

import { SortablePane, Pane } from 'react-sortable-pane';
export const PANE_SIZE = 160;

class Sortable extends Component {
	constructor (props) {
		super(props);

		this.generatePanes = this.generatePanes.bind(this);
		this.handleOrderChange = this.handleOrderChange.bind(this);
		this.removeRelationship = this.removeRelationship.bind(this);
	}

	handleOrderChange (e, id, target, newOrder) {
		const defaultOrder = this.props.items.map(k => k.id);
		if (JSON.stringify(newOrder) === JSON.stringify(defaultOrder)) {
			console.warn('EGUAL');
			return;
		}

		this.props.onOrderChange(newOrder);
	}

	removeRelationship (e, id) {
		e.preventDefault();
		this.props.onRemove(id);
	}

	generatePanes (items) {
		if (!items) {
			return null;
		}
		return items.map((item, i) => {
			return (
				<Pane
					key={item.id}
					size={{ width: PANE_SIZE, height: PANE_SIZE }}
					resizable={{ x: false, y: false, xy: false }}
					style={{
						borderRadius: 5,
						opacity: 1,
						border: '3px solid #ccc',
						backgroundColor: 'rgb(245,245,245)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					}}
				>
					<div
						style={{
							width: '100%',
							height: '100%',
							position: 'relative',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<button
							style={{
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
							}}
							onClick={e => this.removeRelationship(e, item.id)}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									transform: 'rotate(45deg)',
									color: '#fff',
									fontSize: 20,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								+
							</div>
						</button>
						{item.name}
					</div>
				</Pane>
			);
		});
	}

	render () {
		console.log({ paneItems: this.props.items });
		if (!this.props.items.length) {
			return null;
		}
		const panes = this.generatePanes(this.props.items);
		const defaultOrder = this.props.items.map(k => k.id);
		return (
			<SortablePane
				direction="horizontal"
				margin={20}
				defaultOrder={defaultOrder}
				onDragStop={this.handleOrderChange}
			>
				{panes}
			</SortablePane>
		);
	}
}

module.exports = {
	Sortable,
	PANE_SIZE,
};
