/**
 * The Home view is the view one sees at /keystone. It shows a list of all lists,
 * grouped by their section.
 */

import React from 'react';
import { Container, Spinner } from '../../elemental';
import { connect } from 'react-redux';

import Lists from './components/Lists';
import ListWithSingleItem from './components/ListWithSingleItem';
import Section from './components/Section';
import AlertMessages from '../../shared/AlertMessages';
import {
	loadCounts,
} from './actions';

import { selectList, loadItems } from '../List/actions'



var HomeView = React.createClass({
	displayName: 'HomeView',
	getInitialState () {
		return {
			modalIsOpen: true,
		};
	},
	// When everything is rendered, start loading the item counts of the lists
	// from the API
	componentDidMount () {
		this.props.dispatch(loadCounts());
		// Load home pages
		this.props.dispatch(selectList('home-pages'));
		this.props.dispatch(loadItems())
	},
	getSpinner () {
		if (this.props.counts && Object.keys(this.props.counts).length === 0
			&& (this.props.error || this.props.loading)) {
			return (
				<Spinner />
			);
		}
		return null;
	},
	render () {
		const spinner = this.getSpinner();
		const homePageId = this.props.items.results[0] === undefined ? null : this.props.items.results[0].id
		const hasCreatedHomePage = this.props.counts.HomePage > 0

		return (
			<Container data-screen-id="home">
				<div className="dashboard-header">
					<div className="dashboard-heading">{Keystone.brand}</div>
				</div>
				<div className="dashboard-groups">
					{(this.props.error) && (
						<AlertMessages
							alerts={{ error: { error:
								"There is a problem with the network, we're trying to reconnect...",
							} }}
						/>
					)}
					{/* Render flat nav */}
					{Keystone.nav.flat ? (
						<Lists
							counts={this.props.counts}
							lists={Keystone.lists}
							spinner={spinner}
						/>
					) : (
						<div>
							{/* Render nav with sections */}
							{Keystone.nav.sections.map((navSection) => {
								const isHomePage = navSection.label === 'Home'
								if(isHomePage) {
									const list = navSection.lists[0] || {}
									const createHref = list.external ? list.path : `${Keystone.adminPath}/${list.path}`;
									const href = hasCreatedHomePage ? `${Keystone.adminPath}/${list.path}/${homePageId}` : createHref;

									return (
										<Section key={navSection.key} id={navSection.key} label={navSection.label}>
											<ListWithSingleItem
												key={list.path}
												label={navSection.label}
												path={list.path}
												spinner={spinner}
												hasCreatedHomePage={hasCreatedHomePage}
												href={href}
											/>
										</Section>
									);
								}
								return (
									<Section key={navSection.key} id={navSection.key} label={navSection.label}>
										<Lists
											counts={this.props.counts}
											lists={navSection.lists}
											spinner={spinner}
										/>
									</Section>
								);
							})}
							{/* Render orphaned lists */}
							{Keystone.orphanedLists.length ? (
								<Section label="Other" icon="octicon-database">
									<Lists
										counts={this.props.counts}
										lists={Keystone.orphanedLists}
										spinner={spinner}
									/>
								</Section>
							) : null}
						</div>
					)}
				</div>
			</Container>
		);
	},
});

export {
	HomeView,
};

export default connect((state) => ({
	counts: state.home.counts,
	loading: state.home.loading,
	error: state.home.error,
	lists: state.lists,
	loading: state.lists.loading,
	currentList: state.lists.currentList,
	items: state.lists.items,
}))(HomeView);
